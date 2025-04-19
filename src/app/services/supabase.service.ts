import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';
import { Observable, from, map } from 'rxjs';
import { Metadata } from '../models/supabase.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async fetchData() {
    // let { data: metadata, error } = await this.supabase
    //   .from('metadata')
    //   .select('*');

    // return metadata;
  }
}
