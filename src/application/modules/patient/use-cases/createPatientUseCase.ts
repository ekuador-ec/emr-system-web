import type { PatientRepository } from '@/domain/modules/patient/repositories/PatientRepository';
import type { CreatePatientDTO, Patient } from '@/domain/modules/patient/models/Patient';

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

export class CreatePatientUseCase {
  patientRepository: PatientRepository;

  constructor(patientRepository: PatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(data: CreatePatientDTO): Promise<Patient> {
    if (data.idNumber && data.idNumber.trim() !== '') {
      if (!validateEcCedula(data.idNumber)) {
        throw new Error("La cédula ingresada no es válida.");
      }

      const existingPatient = await this.patientRepository.getPatientByIdNumber(data.idNumber);
      if (existingPatient) {
        throw new Error(`Ya existe un paciente registrado con la cedula ${data.idNumber}.`);
      }

      return this.patientRepository.createPatient({
        ...data,
        idNumberType: 'cedula',
      });
    }

    return this.patientRepository.createPatient({
      ...data,
      idNumberType: 'temporal',
    });
  }
}
