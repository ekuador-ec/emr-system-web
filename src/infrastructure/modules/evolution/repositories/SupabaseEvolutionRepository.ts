import type { EvolutionRepository } from '@/domain/modules/evolution/repositories/EvolutionRepository';
import type { CreateEvolutionPayload, MedicalEvolution, UpdateEvolutionPayload } from '@/domain/modules/evolution/models/Evolution';
import { EvolutionMapper } from '../mappers/EvolutionMapper';
import { supabase } from '@/infrastructure/core/supabaseClient';

export class SupabaseEvolutionRepository implements EvolutionRepository {
  
  private async getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user found');
    return user.id;
  }

  async create(payload: CreateEvolutionPayload): Promise<MedicalEvolution> {
    const userId = await this.getUserId();
    
    // First, insert main record
    const evolutionData = EvolutionMapper.toDatabase({ ...payload, status: 'ABIERTA' } as Partial<MedicalEvolution>);
    evolutionData.opened_by = userId;

    const { data: evolution, error } = await supabase
      .from('medical_evolutions')
      .insert(evolutionData)
      .select(`
        *,
        opener:profiles!medical_evolutions_opened_by_fkey(first_name, last_name),
        closer:profiles!medical_evolutions_closed_by_fkey(first_name, last_name)
      `)
      .single();

    if (error) throw new Error(`Error creating evolution: ${error.message}`);

    // Insert relations if any
    const evolutionId = evolution.id;

    if (payload.systemsReview && payload.systemsReview.length > 0) {
      await supabase.from('evolution_systems_review').insert(
        payload.systemsReview.map(r => ({ evolution_id: evolutionId, condition: r.condition, description: r.description }))
      );
    }

    if (payload.physicalExams && payload.physicalExams.length > 0) {
      await supabase.from('evolution_physical_exams').insert(
        payload.physicalExams.map(r => ({ evolution_id: evolutionId, region: r.region, has_pathology: r.hasPathology, description: r.description }))
      );
    }

    if (payload.injuries && payload.injuries.length > 0) {
      await supabase.from('evolution_injuries').insert(
        payload.injuries.map(r => ({ evolution_id: evolutionId, injury_type: r.injuryType }))
      );
    }

    if (payload.diagnoses && payload.diagnoses.length > 0) {
      await supabase.from('evolution_diagnoses').insert(
        payload.diagnoses.map(r => ({ evolution_id: evolutionId, cie10_id: r.cie10Id, type: r.type, certainty: r.certainty, description: r.description }))
      );
    }

    if (payload.discharges && payload.discharges.length > 0) {
      await supabase.from('evolution_discharges').insert(
        payload.discharges.map(r => ({ evolution_id: evolutionId, discharge_type: r.dischargeType }))
      );
    }

    return this.getById(evolutionId);
  }

  async update(id: string, payload: UpdateEvolutionPayload): Promise<MedicalEvolution> {
    const evolutionData = EvolutionMapper.toDatabase(payload as Partial<MedicalEvolution>);
    
    // Only keep defined fields to update
    const updateData = Object.fromEntries(Object.entries(evolutionData).filter(([_, v]) => v !== undefined));

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('medical_evolutions')
        .update(updateData)
        .eq('id', id);

      if (error) throw new Error(`Error updating evolution: ${error.message}`);
    }

    // Update relations - simple strategy: delete and recreate
    if (payload.systemsReview) {
      await supabase.from('evolution_systems_review').delete().eq('evolution_id', id);
      if (payload.systemsReview.length > 0) {
        await supabase.from('evolution_systems_review').insert(
          payload.systemsReview.map(r => ({ evolution_id: id, condition: r.condition, description: r.description }))
        );
      }
    }

    if (payload.physicalExams) {
      await supabase.from('evolution_physical_exams').delete().eq('evolution_id', id);
      if (payload.physicalExams.length > 0) {
        await supabase.from('evolution_physical_exams').insert(
          payload.physicalExams.map(r => ({ evolution_id: id, region: r.region, has_pathology: r.hasPathology, description: r.description }))
        );
      }
    }

    if (payload.injuries) {
      await supabase.from('evolution_injuries').delete().eq('evolution_id', id);
      if (payload.injuries.length > 0) {
        await supabase.from('evolution_injuries').insert(
          payload.injuries.map(r => ({ evolution_id: id, injury_type: r.injuryType }))
        );
      }
    }

    if (payload.diagnoses) {
      await supabase.from('evolution_diagnoses').delete().eq('evolution_id', id);
      if (payload.diagnoses.length > 0) {
        await supabase.from('evolution_diagnoses').insert(
          payload.diagnoses.map(r => ({ evolution_id: id, cie10_id: r.cie10Id, type: r.type, certainty: r.certainty, description: r.description }))
        );
      }
    }

    if (payload.discharges) {
      await supabase.from('evolution_discharges').delete().eq('evolution_id', id);
      if (payload.discharges.length > 0) {
        await supabase.from('evolution_discharges').insert(
          payload.discharges.map(r => ({ evolution_id: id, discharge_type: r.dischargeType }))
        );
      }
    }

    return this.getById(id);
  }

  async close(id: string): Promise<MedicalEvolution> {
    const userId = await this.getUserId();
    
    const { error } = await supabase
      .from('medical_evolutions')
      .update({
        status: 'CERRADA',
        closed_by: userId,
        closed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw new Error(`Error closing evolution: ${error.message}`);
    
    return this.getById(id);
  }

  async getById(id: string): Promise<MedicalEvolution> {
    const { data, error } = await supabase
      .from('medical_evolutions')
      .select(`
        *,
        opener:profiles!medical_evolutions_opened_by_fkey(first_name, last_name),
        closer:profiles!medical_evolutions_closed_by_fkey(first_name, last_name),
        evolution_systems_review(*),
        evolution_physical_exams(*),
        evolution_injuries(*),
        evolution_diagnoses(
          *,
          cie10_pathologies(code, description)
        ),
        evolution_discharges(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(`Error fetching evolution: ${error.message}`);
    
    return EvolutionMapper.toDomain(data);
  }

  async getByMedicalRecordId(medicalRecordId: string): Promise<MedicalEvolution[]> {
    const { data, error } = await supabase
      .from('medical_evolutions')
      .select(`
        *,
        opener:profiles!medical_evolutions_opened_by_fkey(first_name, last_name),
        closer:profiles!medical_evolutions_closed_by_fkey(first_name, last_name)
      `)
      .eq('medical_record_id', medicalRecordId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error fetching evolutions: ${error.message}`);
    
    return data.map(EvolutionMapper.toDomain);
  }
}
