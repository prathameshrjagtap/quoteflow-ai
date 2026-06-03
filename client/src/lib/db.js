/**
 * QuoteFlow AI — Supabase data service
 * All database operations live here. Pages import from this file, never call supabase directly.
 */
import { supabase } from "./supabase";

// ─── QUOTES ──────────────────────────────────────────────────────────────────

export async function fetchQuotes(userId) {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchQuoteById(id) {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createQuote(userId, quoteData) {
  // Count existing quotes for this user to generate sequential number
  const { count, error: countError } = await supabase
    .from("quotes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) throw countError;

  const nextNumber = (count ?? 0) + 1;
  const quoteNumber = `QT-${String(nextNumber).padStart(4, "0")}`;

  const { data, error } = await supabase
    .from("quotes")
    .insert({
      user_id: userId,
      quote_number: quoteNumber,
      customer_name: quoteData.customerName,
      customer_email: quoteData.customerEmail,
      customer_phone: quoteData.customerPhone,
      items: quoteData.items,
      subtotal: quoteData.subtotal,
      gst: quoteData.gst,
      grand_total: quoteData.grandTotal,
      status: "Draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateQuoteStatus(id, status) {
  const { error } = await supabase
    .from("quotes")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

export async function updateQuote(id, quoteData) {
  const { data, error } = await supabase
    .from("quotes")
    .update({
      customer_name: quoteData.customerName,
      customer_email: quoteData.customerEmail,
      customer_phone: quoteData.customerPhone,
      items: quoteData.items,
      subtotal: quoteData.subtotal,
      gst: quoteData.gst,
      grand_total: quoteData.grandTotal,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQuote(id) {
  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────

export async function fetchCustomers(userId) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchCustomerById(id) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function upsertCustomer(userId, { name, email, phone }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Try to increment existing customer's quote count
  const { data: existing } = await supabase
    .from("customers")
    .select("id, total_quotes")
    .eq("user_id", userId)
    .eq("email", normalizedEmail)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("customers")
      .update({ total_quotes: existing.total_quotes + 1 })
      .eq("id", existing.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("customers")
      .insert({
        user_id: userId,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        total_quotes: 1,
      });

    if (error) throw error;
  }
}

export async function deleteCustomer(id) {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function fetchQuotesByCustomerEmail(userId, email) {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("user_id", userId)
    .eq("customer_email", email.toLowerCase())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export async function fetchSettings(userId) {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  // No row yet is not an error — just return null
  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function saveSettings(userId, settings) {
  const { error } = await supabase
    .from("settings")
    .upsert(
      {
        user_id: userId,
        company_name: settings.companyName,
        company_email: settings.companyEmail,
        company_phone: settings.companyPhone,
        gst_number: settings.gstNumber,
        address: settings.address,
        logo_base64: settings.logoBase64,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) throw error;
}
