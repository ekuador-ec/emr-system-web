import type {
  AddForm005EntryResult,
  Form005Repository,
} from "@/domain/modules/form005/repositories/Form005Repository";
import type {
  CreateForm005EntryPayload,
  CreateForm005Payload,
  Form005Document,
  UpdateForm005EntryPayload,
} from "@/domain/modules/form005/models/Form005Document";
import { Form005Mapper } from "../mappers/Form005Mapper";
import { supabase } from "@/infrastructure/core/supabaseClient";

const SELECT_DETAIL = `
  *,
  opener:profiles!form005_documents_opened_by_fkey(first_name, last_name),
  closer:profiles!form005_documents_closed_by_fkey(first_name, last_name),
  form005_entries(
    *,
    author:profiles!form005_entries_created_by_fkey(first_name, last_name, role)
  )
`;

export class SupabaseForm005Repository implements Form005Repository {
  private async getUserId(): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user found");
    return user.id;
  }

  async create(payload: CreateForm005Payload): Promise<Form005Document> {
    const userId = await this.getUserId();

    const { data: document, error } = await supabase
      .from("form005_documents")
      .insert({
        medical_record_id: payload.medicalRecordId,
        status: "ABIERTA",
        opened_by: userId,
      })
      .select("id")
      .single();

    if (error) throw new Error(`Error creating Form 005 document: ${error.message}`);

    return this.getById(document.id);
  }

  async addEntry(
    documentId: string,
    payload: CreateForm005EntryPayload,
  ): Promise<AddForm005EntryResult> {
    const userId = await this.getUserId();
    const entryData = Form005Mapper.entryToDatabase(payload, documentId);
    entryData.created_by = userId;

    const { data: inserted, error } = await supabase
      .from("form005_entries")
      .insert(entryData)
      .select("id")
      .single();
    if (error) throw new Error(`Error saving Form 005 entry: ${error.message}`);

    const document = await this.getById(documentId);
    return { document, entryId: inserted.id };
  }

  async updateEntry(
    documentId: string,
    entryId: string,
    payload: UpdateForm005EntryPayload,
  ): Promise<Form005Document> {
    const entryData = Form005Mapper.entryToDatabase(payload, documentId);
    delete entryData.document_id;
    delete entryData.created_by;

    const { error } = await supabase.from("form005_entries").update(entryData).eq("id", entryId);
    if (error) throw new Error(`Error updating Form 005 entry: ${error.message}`);

    return this.getById(documentId);
  }

  async close(id: string): Promise<Form005Document> {
    const userId = await this.getUserId();

    const { error } = await supabase
      .from("form005_documents")
      .update({
        status: "CERRADA",
        closed_by: userId,
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw new Error(`Error closing Form 005 document: ${error.message}`);

    return this.getById(id);
  }

  async getById(id: string): Promise<Form005Document> {
    const { data, error } = await supabase
      .from("form005_documents")
      .select(SELECT_DETAIL)
      .eq("id", id)
      .single();

    if (error) throw new Error(`Error fetching Form 005 document: ${error.message}`);

    return Form005Mapper.toDomain(data);
  }

  async getByMedicalRecordId(medicalRecordId: string): Promise<Form005Document[]> {
    const { data, error } = await supabase
      .from("form005_documents")
      .select(SELECT_DETAIL)
      .eq("medical_record_id", medicalRecordId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Error fetching Form 005 documents: ${error.message}`);

    return (data ?? []).map(Form005Mapper.toDomain);
  }
}
