import type {
  PatientRepository,
  PatientFilters,
} from "@/domain/modules/patient/repositories/PatientRepository";
import type {
  Patient,
  PatientListItem,
  PaginatedResult,
  CreatePatientDTO,
  UpdatePatientDTO,
} from "@/domain/modules/patient/models/Patient";
import { supabase } from "@/infrastructure/core/supabaseClient";
import {
  endOfLocalDayIso,
  startOfLocalDayIso,
} from "@/infrastructure/core/dateBoundaries";
import {
  mapPatientRow,
  mapPatientListItemRow,
} from "@/infrastructure/modules/patient/mappers/patientMapper";
import type {
  PatientRow,
  PatientListItemRow,
} from "@/infrastructure/modules/patient/mappers/patientMapper";

export class SupabasePatientRepository implements PatientRepository {
  async getPatients(filters?: PatientFilters): Promise<PaginatedResult<PatientListItem>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("patients")
      .select(
        "id, id_number, id_number_type, first_name, last_name, second_last_name, email, phone, blood_type, is_active",
        { count: "exact" },
      )
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (filters?.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    }

    if (filters?.idNumberType) {
      query = query.eq("id_number_type", filters.idNumberType);
    }

    if (filters?.idNumber) {
      query = query
        .eq("id_number_type", "cedula")
        .ilike("id_number", `%${filters.idNumber}%`);
    }

    if (filters?.gender) {
      query = query.eq("gender", filters.gender);
    }

    if (filters?.firstName) {
      query = query.ilike("first_name", `${filters.firstName}%`);
    }

    if (filters?.lastName) {
      query = query.or(
        `last_name.ilike.${filters.lastName}%,second_last_name.ilike.${filters.lastName}%`,
      );
    }

    if (filters?.search) {
      query = query.or(
        `first_name.ilike.${filters.search}%,last_name.ilike.${filters.search}%`,
      );
    }

    if (filters?.startDate) {
      query = query.gte("created_at", startOfLocalDayIso(filters.startDate));
    }

    if (filters?.endDate) {
      query = query.lte("created_at", endOfLocalDayIso(filters.endDate));
    }

    const { data, count, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: (data as unknown as PatientListItemRow[]).map(mapPatientListItemRow),
      total: count || 0,
      page,
      limit,
    };
  }

  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from("patients")
      .select(`
        *,
        occupation:catalog_items(*),
        geographic_location:geographic_locations(*),
        patient_emergency_contacts(*),
        patient_clinical_antecedents!patient_clinical_antecedents_patient_id_fkey(*, pathology:cie10_pathologies(*))
      `)
      .eq("patient_clinical_antecedents.is_active", true)
      .eq("id", id)
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) return null;

    return mapPatientRow(data[0] as unknown as PatientRow);
  }

  async getPatientByIdNumber(idNumber: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from("patients")
      .select(`
        *,
        occupation:catalog_items(*),
        geographic_location:geographic_locations(*)
      `)
      .eq("id_number", idNumber)
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) return null;

    return mapPatientRow(data[0] as unknown as PatientRow);
  }

  async createPatient(patient: CreatePatientDTO): Promise<Patient> {
    const { emergencyContacts, clinicalAntecedents, ...patientData } = patient;

    // Supabase auto-handles snake_case mapping for inserts if configured, but here we construct snake_case
    const payload = {
      id_number: patientData.idNumber ?? undefined,
      id_number_type: patientData.idNumberType,
      first_name: patientData.firstName,
      middle_name: patientData.middleName,
      last_name: patientData.lastName,
      second_last_name: patientData.secondLastName,
      email: patientData.email,
      phone: patientData.phone,
      blood_type: patientData.bloodType,
      birth_date: patientData.birthDate,
      birth_place: patientData.birthPlace,
      gender: patientData.gender,
      nationality: patientData.nationality,
      cultural_group: patientData.culturalGroup,
      cultural_group_other: patientData.culturalGroupOther,
      marital_status: patientData.maritalStatus,
      education_level: patientData.educationLevel,
      occupation_id: patientData.occupationId,
      currently_works: patientData.currentlyWorks,
      health_insurance: patientData.healthInsurance,
      company_name: patientData.companyName,
      company_position: patientData.companyPosition,
      company_phone: patientData.companyPhone,
      company_address: patientData.companyAddress,
      home_address: patientData.homeAddress,
      neighborhood: patientData.neighborhood,
      geographic_location_id: patientData.geographicLocationId,
      info_source_type: patientData.infoSourceType,
      info_source_other: patientData.infoSourceOther,
      info_source_name: patientData.infoSourceName,
      info_source_phone: patientData.infoSourcePhone,
      info_source_observations: patientData.infoSourceObservations,
    };

    const { data, error } = await supabase.from("patients").insert(payload).select("*").single();

    if (error) {
      throw new Error(error.message);
    }

    const createdPatientId = (data as unknown as PatientRow).id;

    if (emergencyContacts && emergencyContacts.length > 0) {
      const contactsPayload = emergencyContacts.map((contact) => ({
        patient_id: createdPatientId,
        name: contact.name,
        kinship: contact.kinship,
        kinship_other: contact.kinshipOther || null,
        phone: contact.phone,
        address: contact.address || null,
      }));
      const { error: contactsError } = await supabase
        .from("patient_emergency_contacts")
        .insert(contactsPayload);
      if (contactsError) throw new Error(`Error saving contacts: ${contactsError.message}`);
    }

    if (clinicalAntecedents && clinicalAntecedents.length > 0) {
      const antecedentsPayload = clinicalAntecedents.map((ant) => ({
        patient_id: createdPatientId,
        antecedent_type: ant.antecedentType,
        pathology_id: ant.pathologyId || null,
        description: ant.description || null,
        diagnosis_date: ant.diagnosisDate || null,
        treatment: ant.treatment || null,
      }));
      const { error: antecedentsError } = await supabase
        .from("patient_clinical_antecedents")
        .insert(antecedentsPayload);
      if (antecedentsError)
        throw new Error(`Error saving antecedents: ${antecedentsError.message}`);
    }

    return this.getPatientById(createdPatientId) as Promise<Patient>;
  }

  async updatePatient(id: string, patient: UpdatePatientDTO): Promise<Patient> {
    const payload: Record<string, any> = {};

    if (typeof patient.idNumber === "string" && patient.idNumber.trim() !== "") {
      payload.id_number = patient.idNumber.trim();
    }
    if (patient.idNumberType !== undefined) payload.id_number_type = patient.idNumberType;
    if (patient.firstName !== undefined) payload.first_name = patient.firstName;
    if (patient.middleName !== undefined) payload.middle_name = patient.middleName;
    if (patient.lastName !== undefined) payload.last_name = patient.lastName;
    if (patient.secondLastName !== undefined) payload.second_last_name = patient.secondLastName;
    if (patient.email !== undefined) payload.email = patient.email;
    if (patient.phone !== undefined) payload.phone = patient.phone;
    if (patient.bloodType !== undefined) payload.blood_type = patient.bloodType;
    if (patient.birthDate !== undefined) payload.birth_date = patient.birthDate;
    if (patient.birthPlace !== undefined) payload.birth_place = patient.birthPlace;
    if (patient.gender !== undefined) payload.gender = patient.gender;
    if (patient.nationality !== undefined) payload.nationality = patient.nationality;
    if (patient.culturalGroup !== undefined) payload.cultural_group = patient.culturalGroup;
    if (patient.culturalGroupOther !== undefined)
      payload.cultural_group_other = patient.culturalGroupOther;
    if (patient.maritalStatus !== undefined) payload.marital_status = patient.maritalStatus;
    if (patient.educationLevel !== undefined) payload.education_level = patient.educationLevel;
    if (patient.occupationId !== undefined) payload.occupation_id = patient.occupationId;
    if (patient.currentlyWorks !== undefined) payload.currently_works = patient.currentlyWorks;
    if (patient.healthInsurance !== undefined) payload.health_insurance = patient.healthInsurance;
    if (patient.companyName !== undefined) payload.company_name = patient.companyName;
    if (patient.companyPosition !== undefined) payload.company_position = patient.companyPosition;
    if (patient.companyPhone !== undefined) payload.company_phone = patient.companyPhone;
    if (patient.companyAddress !== undefined) payload.company_address = patient.companyAddress;
    if (patient.homeAddress !== undefined) payload.home_address = patient.homeAddress;
    if (patient.neighborhood !== undefined) payload.neighborhood = patient.neighborhood;
    if (patient.geographicLocationId !== undefined)
      payload.geographic_location_id = patient.geographicLocationId;
    if (patient.infoSourceType !== undefined) payload.info_source_type = patient.infoSourceType;
    if (patient.infoSourceOther !== undefined) payload.info_source_other = patient.infoSourceOther;
    if (patient.infoSourceName !== undefined) payload.info_source_name = patient.infoSourceName;
    if (patient.infoSourcePhone !== undefined) payload.info_source_phone = patient.infoSourcePhone;
    if (patient.infoSourceObservations !== undefined)
      payload.info_source_observations = patient.infoSourceObservations;
    if (patient.isActive !== undefined) payload.is_active = patient.isActive;

    if (Object.keys(payload).length > 0) {
      const { error } = await supabase.from("patients").update(payload).eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    }

    if (patient.emergencyContacts !== undefined) {
      const { error: deleteContactsError } = await supabase
        .from("patient_emergency_contacts")
        .delete()
        .eq("patient_id", id);

      if (deleteContactsError) {
        throw new Error(`Error deleting old contacts: ${deleteContactsError.message}`);
      }

      if (patient.emergencyContacts.length > 0) {
        const contactsPayload = patient.emergencyContacts.map((contact) => ({
          patient_id: id,
          name: contact.name,
          kinship: contact.kinship,
          kinship_other: contact.kinshipOther || null,
          phone: contact.phone,
          address: contact.address || null,
        }));
        const { error: contactsError } = await supabase
          .from("patient_emergency_contacts")
          .insert(contactsPayload);
        if (contactsError) throw new Error(`Error saving contacts: ${contactsError.message}`);
      }
    }

    if (patient.clinicalAntecedents !== undefined) {
      // 1. Fetch current active antecedents
      const { data: existingAntecedents, error: fetchError } = await supabase
        .from("patient_clinical_antecedents")
        .select("id")
        .eq("patient_id", id)
        .eq("is_active", true);

      if (fetchError) {
        throw new Error(`Error fetching existing antecedents: ${fetchError.message}`);
      }

      const incomingIds = patient.clinicalAntecedents.map((a) => a.id).filter(Boolean) as string[];
      const existingIds = (existingAntecedents || []).map((a: any) => a.id as string);
      const idsToDeactivate = existingIds.filter((exId) => !incomingIds.includes(exId));

      // 2. Soft-delete missing ones (RLS prevents physical delete)
      if (idsToDeactivate.length > 0) {
        const { error: deactivateError } = await supabase
          .from("patient_clinical_antecedents")
          .update({ is_active: false })
          .in("id", idsToDeactivate);

        if (deactivateError) {
          throw new Error(`Error deactivating antecedents: ${deactivateError.message}`);
        }
      }

      // 3. Upsert incoming antecedents
      for (const ant of patient.clinicalAntecedents) {
        const antPayload = {
          patient_id: id,
          antecedent_type: ant.antecedentType,
          pathology_id: ant.pathologyId || null,
          description: ant.description || null,
          diagnosis_date: ant.diagnosisDate || null,
          treatment: ant.treatment || null,
          is_active: true, // ensure it remains active
        };

        const isValidExistingId = ant.id && ant.id.trim() !== "";

        if (isValidExistingId) {
          // Update existing
          const { error: updateError } = await supabase
            .from("patient_clinical_antecedents")
            .update(antPayload)
            .eq("id", ant.id);

          if (updateError) throw new Error(`Error updating antecedent: ${updateError.message}`);
        } else {
          // Insert new
          const { error: insertError } = await supabase
            .from("patient_clinical_antecedents")
            .insert(antPayload);

          if (insertError) throw new Error(`Error saving antecedents: ${insertError.message}`);
        }
      }
    }

    return this.getPatientById(id) as Promise<Patient>;
  }

  async togglePatientStatus(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase.from("patients").update({ is_active: isActive }).eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }
}
