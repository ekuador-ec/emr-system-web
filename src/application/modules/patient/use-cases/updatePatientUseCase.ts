import type { PatientRepository } from '@/domain/modules/patient/repositories/PatientRepository';
import type { UpdatePatientDTO, Patient } from '@/domain/modules/patient/models/Patient';

const CEDULA_REGEX = /^[0-9]{10}$/;

function validateEcCedula(cedula: string): boolean {
  if (!CEDULA_REGEX.test(cedula)) return false;

  const province = parseInt(cedula.substring(0, 2), 10);
  if (province < 1 || province > 24) return false;

  if (parseInt(cedula[2], 10) >= 6) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let value = parseInt(cedula[i], 10);
    if (i % 2 === 0) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
  }

  const verifier = (10 - (sum % 10)) % 10;
  return verifier === parseInt(cedula[9], 10);
}

export class UpdatePatientUseCase {
  patientRepository: PatientRepository;

  constructor(patientRepository: PatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(id: string, data: UpdatePatientDTO): Promise<Patient> {
    const existingPatient = await this.patientRepository.getPatientById(id);
    if (!existingPatient) {
      throw new Error(`No se encontro el paciente con id ${id}.`);
    }

    const { idNumber: incomingIdNumber, idNumberType: _ignoredIdNumberType, ...rest } = data;
    const updateData: UpdatePatientDTO = { ...rest };

    const normalizedIdNumber = typeof incomingIdNumber === 'string' ? incomingIdNumber.trim() : '';
    const isPromotingTemporalToCedula =
      existingPatient.idNumberType === 'temporal' && normalizedIdNumber !== '';

    if (isPromotingTemporalToCedula) {
      if (!validateEcCedula(normalizedIdNumber)) {
        throw new Error('El numero de cedula ingresado no es valido (verificacion Modulo 10 fallida).');
      }

      const duplicate = await this.patientRepository.getPatientByIdNumber(normalizedIdNumber);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`Ya existe otro paciente registrado con la cedula ${normalizedIdNumber}.`);
      }

      updateData.idNumber = normalizedIdNumber;
      updateData.idNumberType = 'cedula';
    }

    return this.patientRepository.updatePatient(id, updateData);
  }
}
