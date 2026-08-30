--
-- PostgreSQL database dump
--

\restrict WfRnFoemEXOylPlJnETB2eUlvgLKbWrMYmT19S6n3iTmNSjoYGetRZBC796RQvA

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    status text DEFAULT 'Active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.categories ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    company_name text NOT NULL,
    contact_person text,
    phone text,
    email text,
    address_line1 text,
    lead_source text DEFAULT 'Manual'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    city text,
    gstin text,
    designation text,
    alt_phone text,
    pan text,
    cin text,
    state_code text,
    address_line2 text,
    state text,
    country text DEFAULT 'India'::text NOT NULL,
    pincode text,
    notes text,
    reference text,
    address_line3 text
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.customers ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: email_campaign_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaign_recipients (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    recipient_email text NOT NULL,
    recipient_name text,
    sender_account_id integer,
    status text DEFAULT 'pending'::text NOT NULL,
    error text,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_campaign_recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.email_campaign_recipients ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.email_campaign_recipients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: email_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns (
    id integer NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    recipient_source text NOT NULL,
    filters jsonb DEFAULT '{}'::jsonb NOT NULL,
    total_recipients integer DEFAULT 0 NOT NULL,
    sent_count integer DEFAULT 0 NOT NULL,
    failed_count integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'sending'::text NOT NULL,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.email_campaigns ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.email_campaigns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: email_sender_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_sender_accounts (
    id integer NOT NULL,
    label text NOT NULL,
    smtp_host text NOT NULL,
    smtp_port integer DEFAULT 587 NOT NULL,
    smtp_secure boolean DEFAULT false NOT NULL,
    smtp_user text NOT NULL,
    smtp_password text NOT NULL,
    from_email text NOT NULL,
    from_name text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_sender_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.email_sender_accounts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.email_sender_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiries (
    id integer NOT NULL,
    company_name text,
    contact_person text NOT NULL,
    email text NOT NULL,
    phone text,
    address text,
    industry text,
    lead_source text NOT NULL,
    purpose text,
    product_interest text[] DEFAULT '{}'::text[] NOT NULL,
    quantity text,
    message text NOT NULL,
    status text DEFAULT 'New'::text NOT NULL,
    customer_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: inquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.inquiries ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.inquiries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: product_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_stock (
    id integer NOT NULL,
    product_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT product_stock_quantity_non_negative CHECK ((quantity >= 0))
);


--
-- Name: product_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.product_stock ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.product_stock_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    product_name text NOT NULL,
    description text,
    hsn_sac text,
    unit text DEFAULT 'Nos'::text NOT NULL,
    unit_price numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    gst_percent numeric(5,2) DEFAULT '18'::numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text,
    product_code text,
    barcode text,
    qr_code text,
    category_id integer,
    sub_group_id integer,
    brand text,
    model text,
    min_stock integer DEFAULT 0 NOT NULL,
    max_stock integer DEFAULT 0 NOT NULL,
    opening_stock integer DEFAULT 0 NOT NULL,
    track_batch boolean DEFAULT false NOT NULL,
    track_expiry boolean DEFAULT false NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.products ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    purchase_number text NOT NULL,
    purchase_date text NOT NULL,
    supplier_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    invoice_number text,
    payment_mode text DEFAULT 'Cash'::text NOT NULL,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    subtotal numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    discount_total numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    gst_total numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    total_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    status text DEFAULT 'Received'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.purchases ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.purchases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotations (
    id integer NOT NULL,
    quotation_number text NOT NULL,
    customer_id integer,
    inquiry_id integer,
    sales_executive_id integer,
    subject text NOT NULL,
    quotation_date text,
    valid_until text,
    reference_number text,
    tax_type text DEFAULT 'cgst_sgst'::text NOT NULL,
    bill_to_company text NOT NULL,
    bill_to_contact text,
    bill_to_email text,
    bill_to_phone text,
    bill_to_gstin text,
    bill_to_state_code text,
    bill_to_city text,
    bill_to_state text,
    bill_to_address text,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    subtotal numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    discount_total numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    taxable_value numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    cgst_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    sgst_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    igst_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    status text DEFAULT 'Draft'::text NOT NULL,
    notes text,
    terms_and_conditions text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    delivery_time text
);


--
-- Name: quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.quotations ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.quotations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    invoice_number text NOT NULL,
    sale_date text NOT NULL,
    customer_id integer,
    warehouse_id integer NOT NULL,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    subtotal numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    discount_total numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    gst_total numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    total_amount numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    status text DEFAULT 'Completed'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sales_executives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_executives (
    id integer NOT NULL,
    name text NOT NULL,
    employee_code text,
    designation text,
    email text,
    phone text,
    alt_phone text,
    region text,
    city text,
    state text,
    joining_date text,
    active boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sales_executives_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sales_executives ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sales_executives_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sales ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: seller_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seller_settings (
    id integer NOT NULL,
    company_name text,
    gstin text,
    pan text,
    cin text,
    state_code text,
    email text,
    phone text,
    website text,
    authorised_signatory_name text,
    city text,
    state text,
    country text DEFAULT 'India'::text NOT NULL,
    pincode text,
    address text,
    signatory_name text,
    signed_date text,
    expiry_date text,
    bank_name text,
    account_number text,
    ifsc text,
    branch text,
    upi_id text,
    numbering_prefix text DEFAULT 'QTN-'::text NOT NULL,
    numbering_next_sequence integer DEFAULT 1 NOT NULL,
    numbering_padding integer DEFAULT 6 NOT NULL,
    default_validity_days integer DEFAULT 15 NOT NULL,
    default_gst_percent numeric(5,2) DEFAULT '18'::numeric NOT NULL,
    default_currency text DEFAULT 'INR'::text NOT NULL,
    default_terms text,
    default_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    logo_url text,
    smtp_host text,
    smtp_port integer,
    smtp_secure boolean DEFAULT false NOT NULL,
    smtp_user text,
    smtp_password text,
    smtp_from_email text,
    smtp_from_name text
);


--
-- Name: seller_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.seller_settings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.seller_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: staff_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_roles (
    id integer NOT NULL,
    email text NOT NULL,
    name text,
    role text DEFAULT 'staff'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    sales_executive_id integer
);


--
-- Name: staff_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.staff_roles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.staff_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: stock_adjustments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_adjustments (
    id integer NOT NULL,
    product_id integer NOT NULL,
    type text NOT NULL,
    quantity integer NOT NULL,
    warehouse_id integer,
    from_warehouse_id integer,
    to_warehouse_id integer,
    reason text,
    notes text,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.stock_adjustments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.stock_adjustments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: stock_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_history (
    id integer NOT NULL,
    product_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    type text NOT NULL,
    quantity integer NOT NULL,
    ref_type text,
    ref_id integer,
    batch_number text,
    serial_number text,
    expiry_date text,
    manufacturing_date text,
    notes text,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: stock_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.stock_history ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.stock_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sub_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sub_groups (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name text NOT NULL,
    description text,
    status text DEFAULT 'Active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sub_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sub_groups ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sub_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name text NOT NULL,
    company_name text,
    gstin text,
    phone text,
    email text,
    address text,
    outstanding_balance numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    status text DEFAULT 'Active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.suppliers ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.suppliers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    name text NOT NULL,
    location text,
    is_default boolean DEFAULT false NOT NULL,
    status text DEFAULT 'Active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.warehouses ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.warehouses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    short_description text,
    description text,
    image_url text,
    banner_url text,
    display_order integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    seo_title text,
    seo_description text,
    seo_keywords text,
    og_image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_categories ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_media_library; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_media_library (
    id integer NOT NULL,
    image_url text NOT NULL,
    file_name text,
    alt_text text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_media_library_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_media_library ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_media_library_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_product_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_product_applications (
    id integer NOT NULL,
    product_id integer NOT NULL,
    label text NOT NULL,
    image_url text,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_product_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_product_applications ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_product_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_product_config_input_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_product_config_input_types (
    id integer NOT NULL,
    product_id integer NOT NULL,
    label text NOT NULL,
    image_url text,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_product_config_input_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_product_config_input_types ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_product_config_input_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_product_faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_product_faqs (
    id integer NOT NULL,
    product_id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_product_faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_product_faqs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_product_faqs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_product_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_product_features (
    id integer NOT NULL,
    product_id integer NOT NULL,
    text text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_product_features_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_product_features ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_product_features_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_product_images (
    id integer NOT NULL,
    product_id integer NOT NULL,
    image_url text NOT NULL,
    alt_text text,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_product_images ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_product_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_product_key_range; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_product_key_range (
    id integer NOT NULL,
    product_id integer NOT NULL,
    label text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_product_key_range_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_product_key_range ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_product_key_range_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_product_model_range_rows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_product_model_range_rows (
    id integer NOT NULL,
    product_id integer NOT NULL,
    cells text[] NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_product_model_range_rows_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_product_model_range_rows ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_product_model_range_rows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_product_mounting_variant_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_product_mounting_variant_features (
    id integer NOT NULL,
    variant_id integer NOT NULL,
    text text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_product_mounting_variant_features_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_product_mounting_variant_features ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_product_mounting_variant_features_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_product_mounting_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_product_mounting_variants (
    id integer NOT NULL,
    product_id integer NOT NULL,
    name text NOT NULL,
    image_url text,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_product_mounting_variants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_product_mounting_variants ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_product_mounting_variants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_product_related; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_product_related (
    id integer NOT NULL,
    product_id integer NOT NULL,
    related_product_id integer NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_product_related_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_product_related ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_product_related_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_product_spec_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_product_spec_groups (
    id integer NOT NULL,
    product_id integer NOT NULL,
    group_name text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_product_spec_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_product_spec_groups ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_product_spec_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_product_specs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_product_specs (
    id integer NOT NULL,
    group_id integer NOT NULL,
    label text NOT NULL,
    value text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: web_product_specs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_product_specs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_product_specs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: web_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.web_products (
    id integer NOT NULL,
    category_id integer,
    name text NOT NULL,
    slug text NOT NULL,
    series text,
    tagline text,
    description text,
    main_image_url text,
    description_image_url text,
    description_title text,
    doc_url text,
    video_url text,
    status text DEFAULT 'draft'::text NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    seo_title text,
    seo_description text,
    seo_keywords text,
    og_image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    model_range_headers text[]
);


--
-- Name: web_products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.web_products ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.web_products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	e94b2662084cdb2522813ce0add86eb360332c2924184839d9a65d5649ec9022	1785936482881
2	38a309c0137e8ed3a83dad7e92dd465c425d732072b459f13a874040550a2743	1785954898828
3	ded053c4ca3df3a077c2a93c6b877c54a065090f2f5e845867b2e1536fcbc28a	1785955381095
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description, status, created_at, updated_at) FROM stdin;
1	NMRV	\N	Active	2026-08-08 05:58:52.773681+00	2026-08-08 05:58:52.773681+00
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, company_name, contact_person, phone, email, address_line1, lead_source, created_at, updated_at, city, gstin, designation, alt_phone, pan, cin, state_code, address_line2, state, country, pincode, notes, reference, address_line3) FROM stdin;
5	Sanstar Limited	Jignesh Patel	9999696969	jignesh@kbsengineering.com	Mumbai - Maharashtra	Manual	2026-08-06 12:10:40.699673+00	2026-08-06 12:57:27.987+00	Mumbai	24AAACC1062D1ZA	\N	\N	\N	DD564654065460460565	26	\N	Maharashtra	India	\N	\N	\N	\N
\.


--
-- Data for Name: email_campaign_recipients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_campaign_recipients (id, campaign_id, recipient_email, recipient_name, sender_account_id, status, error, sent_at, created_at) FROM stdin;
\.


--
-- Data for Name: email_campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_campaigns (id, subject, body, recipient_source, filters, total_recipients, sent_count, failed_count, status, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: email_sender_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_sender_accounts (id, label, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, from_email, from_name, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inquiries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inquiries (id, company_name, contact_person, email, phone, address, industry, lead_source, purpose, product_interest, quantity, message, status, customer_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_stock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_stock (id, product_id, warehouse_id, quantity, created_at, updated_at) FROM stdin;
1	1	1	2	2026-08-08 06:05:50.642354+00	2026-08-19 10:27:30.372+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, product_name, description, hsn_sac, unit, unit_price, gst_percent, created_at, updated_at, image_url, product_code, barcode, qr_code, category_id, sub_group_id, brand, model, min_stock, max_stock, opening_stock, track_batch, track_expiry) FROM stdin;
1	NMRV30-7.5-63B5	\N	225252	Nos	4800.00	18.00	2026-08-06 11:58:49.755227+00	2026-08-08 19:45:35.915+00	/objects/uploads/e8d31b78-b02d-47e4-972e-df05ad26a20b	PRD-000001	\N	\N	1	1	\N	\N	5	0	0	f	f
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchases (id, purchase_number, purchase_date, supplier_id, warehouse_id, invoice_number, payment_mode, items, subtotal, discount_total, gst_total, total_amount, status, notes, created_at, updated_at) FROM stdin;
1	PUR-000001	2026-08-08	1	1	#001	Cash	[{"price": 3500, "quantity": 5, "productId": 1, "gstPercent": 18, "discPercent": 0, "productName": "NMRV30-7.5-63B5"}]	17500.00	0.00	3150.00	20650.00	Received	\N	2026-08-08 06:05:50.642354+00	2026-08-08 06:05:50.642354+00
2	PUR-000002	2026-08-08	1	1	\N	Cash	[{"price": 4800, "quantity": 10, "productId": 1, "gstPercent": 18, "discPercent": 0, "productName": "NMRV30-7.5-63B5"}]	48000.00	0.00	8640.00	56640.00	Received	\N	2026-08-08 06:12:12.293529+00	2026-08-08 06:12:12.293529+00
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quotations (id, quotation_number, customer_id, inquiry_id, sales_executive_id, subject, quotation_date, valid_until, reference_number, tax_type, bill_to_company, bill_to_contact, bill_to_email, bill_to_phone, bill_to_gstin, bill_to_state_code, bill_to_city, bill_to_state, bill_to_address, items, subtotal, discount_total, taxable_value, cgst_amount, sgst_amount, igst_amount, amount, currency, status, notes, terms_and_conditions, created_at, updated_at, delivery_time) FROM stdin;
3	SSD-000003	5	\N	1	Quotation for Sanstar Limited	2026-08-19	2026-09-09	\N	cgst_sgst	Sanstar Limited	Jignesh Patel	jignesh@kbsengineering.com	9999696969	24AAACC1062D1ZA	26	Mumbai	Maharashtra	Mumbai - Maharashtra	[{"qty": 10, "rate": 4800, "hsnSac": "225252", "itemName": "NMRV30-7.5-63B5", "productId": 1, "gstPercent": 18, "description": "", "discPercent": 0}]	48000.00	0.00	48000.00	4320.00	4320.00	0.00	56640.00	INR	Draft	If you have any questions about this prices quote, Please contact sales@starshinedrive.com, +91-99250-01323\nThank you for your Business!	1. All Above Prices are Ex-Morbi.\n2. All Taxes are Extra.\n3. Payment 100% Advanced.\n4. Freight Charges at your Account.\n5. We are not Responsible if any damage made during transportation.\n6. Subject to Morbi Jurisdiction Only.	2026-08-19 10:13:24.478411+00	2026-08-19 10:13:24.478411+00	3 Week
1	QTN-000001	5	\N	1	Quotation for KBS Engineering	2026-08-06	2026-08-21	Sanstar Limited	igst	Sanstar Limited	Jignesh Patel	jignesh@kbsengineering.com	9999696969	24AAACC1062D1ZA	26	Mumbai	Maharashtra	Mumbai - Maharashtra	[{"qty": 1, "rate": 4800, "hsnSac": "225252", "itemName": "MNRV 63", "gstPercent": 18, "description": "", "discPercent": 10}]	4800.00	480.00	4320.00	0.00	0.00	777.60	5097.60	INR	Expired	If you have any questions about this prices quote, Please contact sales@starshinedrive.com, +91-99250-01323\nThank you for your Business!	Terms & Conditions of Sale\n\n1) Goods, Services, Software, License Keys, Activation Codes, Digital Downloads, and Subscription Services once sold, delivered, or activated shall not be accepted back and are non-refundable.	2026-08-06 12:13:36.600411+00	2026-08-06 13:31:11.695+00	\N
4	SSD-000004	5	\N	\N	Quotation for Sanstar Limited	2026-08-19	2026-09-18	\N	igst	Sanstar Limited	Jignesh Patel	jignesh@kbsengineering.com	9999696969	24AAACC1062D1ZA	26	Mumbai	Maharashtra	Mumbai - Maharashtra	[{"qty": 1, "rate": 4800, "hsnSac": "225252", "itemName": "NMRV30-7.5-63B5", "productId": 1, "gstPercent": 18, "description": "", "discPercent": 0}]	4800.00	0.00	4800.00	0.00	0.00	864.00	5664.00	INR	Draft	If you have any questions about this prices quote, Please contact sales@starshinedrive.com, +91-99250-01323\nThank you for your Business!	1. All Above Prices are Ex-Morbi.\n2. All Taxes are Extra.\n3. Payment 100% Advanced.\n4. Freight Charges at your Account.\n5. We are not Responsible if any damage made during transportation.\n6. Subject to Morbi Jurisdiction Only.	2026-08-19 10:23:10.572712+00	2026-08-19 10:23:10.572712+00	1
2	SSD-000002	5	\N	1	Quotation for Sanstar Limited	2026-08-06	2026-09-05	\N	igst	Sanstar Limited	Jignesh Patel	jignesh@kbsengineering.com	9999696969	24AAACC1062D1ZA	26	Mumbai	Maharashtra	Mumbai - Maharashtra	[{"qty": 1, "rate": 4800, "hsnSac": "225252", "itemName": "MNRV 63", "gstPercent": 18, "description": "", "discPercent": 0}]	4800.00	0.00	4800.00	0.00	0.00	864.00	5664.00	INR	Accepted	If you have any questions about this prices quote, Please contact sales@starshinedrive.com, +91-99250-01323\nThank you for your Business!	1. All Above Prices are Ex-Morbi.\n2. All Taxes are Extra.\n3. Payment 100% Advanced.\n4. Freight Charges at your Account.\n5. We are not Responsible if any damage made during transportation.\n6. Subject to Morbi Jurisdiction Only.	2026-08-06 13:31:25.257354+00	2026-08-07 10:54:52.71+00	\N
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales (id, invoice_number, sale_date, customer_id, warehouse_id, items, subtotal, discount_total, gst_total, total_amount, status, notes, created_at, updated_at) FROM stdin;
1	SAL-000001	2026-08-08	\N	1	[{"price": 4800, "quantity": 5, "productId": 1, "gstPercent": 18, "discPercent": 0, "productName": "NMRV30-7.5-63B5"}]	24000.00	0.00	4320.00	28320.00	Completed	\N	2026-08-08 06:13:26.002155+00	2026-08-08 06:13:26.002155+00
2	SAL-000002	2026-08-08	5	1	[{"price": 4800, "quantity": 8, "productId": 1, "gstPercent": 18, "discPercent": 0, "productName": "NMRV30-7.5-63B5"}]	38400.00	0.00	6912.00	45312.00	Completed	\N	2026-08-08 06:29:40.150378+00	2026-08-19 10:27:30.375+00
\.


--
-- Data for Name: sales_executives; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_executives (id, name, employee_code, designation, email, phone, alt_phone, region, city, state, joining_date, active, notes, created_at, updated_at) FROM stdin;
1	Nikhil Bhatti	01	Sales Head	sales@starshinedrive.com	7265055833	\N	Indian	\N	\N	\N	t	\N	2026-08-06 11:53:26.907057+00	2026-08-17 11:56:35.461+00
\.


--
-- Data for Name: seller_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seller_settings (id, company_name, gstin, pan, cin, state_code, email, phone, website, authorised_signatory_name, city, state, country, pincode, address, signatory_name, signed_date, expiry_date, bank_name, account_number, ifsc, branch, upi_id, numbering_prefix, numbering_next_sequence, numbering_padding, default_validity_days, default_gst_percent, default_currency, default_terms, default_notes, created_at, updated_at, logo_url, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, smtp_from_email, smtp_from_name) FROM stdin;
1	Starshine Drive	24AFHFS5422E1Z7	AFHFS5422E	\N	24	sales@starshinedrive.com	\N	www.starshinedrive.com	\N	Morbi	Gujarat	India	363642	Ground Floor, Plot No. 4, Survey No. 251P2, Jetpar Pipli Road, Bela Rangpar, Morbi - 363642	\N	\N	\N	ICICI Bank	359172085211	ICIC00252	Yagnik Road	\N	SSD-	5	6	30	18.00	INR	1. All Above Prices are Ex-Morbi.\n2. All Taxes are Extra.\n3. Payment 100% Advanced.\n4. Freight Charges at your Account.\n5. We are not Responsible if any damage made during transportation.\n6. Subject to Morbi Jurisdiction Only.	If you have any questions about this prices quote, Please contact sales@starshinedrive.com, +91-99250-01323\nThank you for your Business!	2026-08-06 11:49:44.399557+00	2026-08-19 10:23:10.575+00	/objects/uploads/678fbb1e-3e5d-4fb5-9d96-12ecf84531d8	\N	\N	f	\N	\N	\N	\N
\.


--
-- Data for Name: staff_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_roles (id, email, name, role, created_at, updated_at, sales_executive_id) FROM stdin;
1	uquicktechnologies@gmail.com	\N	admin	2026-08-17 10:59:05.29609+00	2026-08-17 10:59:05.29609+00	\N
2	aditi@restorex360.com	\N	admin	2026-08-17 11:38:14.671199+00	2026-08-17 11:38:14.671199+00	\N
3	sales@starshinedrive.com	Nikhil Bhatti	admin	2026-08-17 11:56:52.063805+00	2026-08-17 11:56:52.063805+00	1
\.


--
-- Data for Name: stock_adjustments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_adjustments (id, product_id, type, quantity, warehouse_id, from_warehouse_id, to_warehouse_id, reason, notes, created_by, created_at, updated_at) FROM stdin;
1	1	increase	5	1	\N	\N	\N	\N	surefix.store@gmail.com	2026-08-08 06:39:55.249267+00	2026-08-08 06:39:55.249267+00
2	1	decrease	5	1	\N	\N	\N	\N	surefix.store@gmail.com	2026-08-08 06:42:23.497521+00	2026-08-08 06:42:23.497521+00
\.


--
-- Data for Name: stock_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_history (id, product_id, warehouse_id, type, quantity, ref_type, ref_id, batch_number, serial_number, expiry_date, manufacturing_date, notes, created_by, created_at) FROM stdin;
1	1	1	purchase	5	purchase	1	\N	\N	\N	\N	\N	surefix.store@gmail.com	2026-08-08 06:05:50.642354+00
2	1	1	purchase	10	purchase	2	\N	\N	\N	\N	\N	surefix.store@gmail.com	2026-08-08 06:12:12.293529+00
3	1	1	sale	5	sale	1	\N	\N	\N	\N	\N	surefix.store@gmail.com	2026-08-08 06:13:26.002155+00
4	1	1	sale	8	sale	2	\N	\N	\N	\N	\N	surefix.store@gmail.com	2026-08-08 06:29:40.150378+00
5	1	1	adjustment_increase	5	adjustment	\N	\N	\N	\N	\N	\N	surefix.store@gmail.com	2026-08-08 06:39:55.249267+00
6	1	1	adjustment_decrease	5	adjustment	\N	\N	\N	\N	\N	\N	surefix.store@gmail.com	2026-08-08 06:42:23.497521+00
7	1	1	adjustment_increase	8	sale-edit-reversal	2	\N	\N	\N	\N	Sale edited	aditi@restorex360.com	2026-08-19 10:27:30.245636+00
8	1	1	sale	8	sale	2	\N	\N	\N	\N	\N	aditi@restorex360.com	2026-08-19 10:27:30.245636+00
\.


--
-- Data for Name: sub_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sub_groups (id, category_id, name, description, status, created_at, updated_at) FROM stdin;
1	1	NMRV30	\N	Active	2026-08-08 05:59:03.062655+00	2026-08-08 05:59:03.062655+00
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, name, company_name, gstin, phone, email, address, outstanding_balance, notes, status, created_at, updated_at) FROM stdin;
1	China	XYZ Company	24525563636366	9909509094	kjshjshd@gmail.com	Diwan para main road, rajkot - 360001	0.00	\N	Active	2026-08-08 06:01:47.63027+00	2026-08-08 06:36:39.362+00
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warehouses (id, name, location, is_default, status, created_at, updated_at) FROM stdin;
1	Morbi	\N	f	Active	2026-08-08 06:01:53.218956+00	2026-08-08 06:01:53.218956+00
\.


--
-- Data for Name: web_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_categories (id, name, slug, short_description, description, image_url, banner_url, display_order, status, seo_title, seo_description, seo_keywords, og_image_url, created_at, updated_at) FROM stdin;
2	RV / NMRV Worm Gear Reducers	rv-nmrv-worm-gear-reducers	\N	\N	\N	\N	2	published	\N	\N	\N	\N	2026-08-08 15:44:41.655962+00	2026-08-08 15:44:48.266+00
3	Compact Geared Motors	compact-geared-motors	\N	\N	\N	\N	3	published	\N	\N	\N	\N	2026-08-08 15:45:01.975633+00	2026-08-08 15:45:01.975633+00
4	Helical-Hypoid Gear Units	helical-hypoid-gear-units	\N	\N	\N	\N	4	published	\N	\N	\N	\N	2026-08-08 15:45:17.456237+00	2026-08-08 15:45:17.456237+00
1	R/F/K/S Series Gear Speed Reducers	r-f-k-s-series-gear-speed-reducers	\N	\N	\N	\N	0	published	\N	\N	\N	\N	2026-08-08 15:41:53.609602+00	2026-08-08 15:49:10.365+00
\.


--
-- Data for Name: web_media_library; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_media_library (id, image_url, file_name, alt_text, created_at, updated_at) FROM stdin;
6	/objects/uploads/e8d31b78-b02d-47e4-972e-df05ad26a20b	nmrv-worm-gear-reducers.webp	\N	2026-08-08 19:45:03.583712+00	2026-08-08 19:45:03.583712+00
7	/objects/uploads/b1093cd9-990a-483f-9da4-f3345defe4b7	starshinne_logo.webp	\N	2026-08-08 19:45:17.024174+00	2026-08-08 19:45:17.024174+00
8	/objects/uploads/67919c07-dfeb-464b-93df-3d4a5831e1e3	rf-series-helical-gear-reducer_1785679341594.webp	\N	2026-08-08 19:46:35.503016+00	2026-08-08 19:46:35.503016+00
9	/objects/uploads/718ad158-caa1-48e8-a1f7-1054edbb6d99	r-series-helical-gear-reducer_1785677909394.webp	\N	2026-08-08 19:46:59.095318+00	2026-08-08 19:46:59.095318+00
\.


--
-- Data for Name: web_product_applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_product_applications (id, product_id, label, image_url, display_order, created_at, updated_at) FROM stdin;
5	2	Belt Conveyor Systems	/public-objects/r-series/R-Series-Helical-Gear-Reducer-For-Belt-Conveyor-Systems_1785678165007.webp	0	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
6	2	Ceramic Kiln Roller Conveyor	/public-objects/r-series/R-Series-Helical-Gear-Reducer-For-Ceramic-Kiln-Roller-Conveyo_1785678165007.webp	1	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
7	2	Food & Beverage Transfer	/public-objects/r-series/R-Series-Helical-Gear-Reducer-For-Food-and-Beverage-Transfer-_1785678165008.webp	2	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
8	2	Glass Sheet Roller Tables	/public-objects/r-series/R-Series-Helical-Gear-Reducer-For-Glass-Sheet-Roller-Tables_1785678165008.webp	3	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
9	2	Industrial Mixers & Process	/public-objects/r-series/R-Series-Helical-Gear-Reducer-For-Industrial-Mixers-and-Proce_1785678165009.webp	4	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
10	2	Packaging Conveyor Modules	/public-objects/r-series/R-Series-Helical-Gear-Reducer-For-Packaging-Conveyor-Modules_1785678165009.webp	5	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
11	2	Roller Conveyor Lines	/public-objects/r-series/R-Series-Helical-Gear-Reducer-For-Roller-Conveyor-Lines_1785678165009.webp	6	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
12	2	Woodworking Panel Feed Line	/public-objects/r-series/R-Series-Helical-Gear-Reducer-For-Woodworking-Panel-Feed-Line_1785678165010.webp	7	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
\.


--
-- Data for Name: web_product_config_input_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_product_config_input_types (id, product_id, label, image_url, display_order, created_at, updated_at) FROM stdin;
4	2	Direct Motor Input	/public-objects/r-series/R-series-with-Direct-Motor-Input_1785677982993.webp	0	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
5	2	Shaft Input	/public-objects/r-series/R-series-with-Shaft-Input_1785678002515.webp	1	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
6	2	Flange Input	/public-objects/r-series/R-series-with-Flange-Input_1785678018884.webp	2	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
\.


--
-- Data for Name: web_product_faqs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_product_faqs (id, product_id, question, answer, display_order, created_at, updated_at) FROM stdin;
3	2	Is R Series the same as RF Series?	RF is best treated as a flange-mounted configuration under the R Series inline helical reducer direction. R is the main inline helical product, while RF is used when flange mounting is required.	0	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
4	2	What is the difference between R Series and F Series?	The R Series is an inline (coaxial) helical reducer where the input and output shafts share the same axis. The F Series is a parallel-shaft helical reducer where the input and output shafts run parallel but offset, making it more compact in height for applications requiring a lower profile.	1	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
5	2	What is the difference between R Series and K Series?	The R Series uses inline helical gears for high-efficiency, quiet, coaxial power transmission. The K Series is a helical-bevel gear reducer with a 90° shaft angle, suitable for applications requiring a right-angle drive with high torque density.	2	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
6	2	What is the difference between R Series and NMRV worm reducer?	The R Series helical gear reducer offers significantly higher efficiency (up to 98% per stage) and handles higher power and torque ranges. NMRV worm reducers are more compact and cost-effective for lower-power, lower-speed applications but have lower efficiency due to sliding contact in the worm gear set.	3	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
7	2	Can R Series be supplied with a motor?	Yes. Starshine can supply the R Series as a complete gearmotor unit with an IEC-standard electric motor (standard, brake, or VFD-rated). Motor power from 0.12 kW to 160 kW is available. Please specify the required output speed, torque, and motor voltage when enquiring.	4	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
8	2	Can R Series be used with a frequency converter?	Yes. The R Series is fully compatible with variable frequency drives (VFDs/inverters). For continuous operation below 25 Hz, forced cooling or an independent fan motor is recommended to maintain adequate cooling. Please specify VFD operation when ordering so the correct motor insulation class is selected.	5	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
9	2	What information is needed before quotation?	To prepare an accurate quotation, please provide: required output speed (r/min) or gear ratio, output torque (N·m) or motor power (kW), mounting position (foot, flange, or shaft-mounted), input configuration (direct motor, shaft, or flange), operating environment (temperature, humidity, duty cycle), and any special requirements such as IP rating, oil type, or output shaft dimensions.	6	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
10	2	Can Starshine provide drawings and CAD files?	Yes. 2D dimensional drawings (PDF/DWG) and 3D CAD models (STEP/IGES) are available for all standard R Series sizes. Please contact our technical team with the model number and required format. Custom CAD files for modified or special units are provided after order confirmation.	7	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
\.


--
-- Data for Name: web_product_features; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_product_features (id, product_id, text, display_order, created_at, updated_at) FROM stdin;
4	2	Up to 4-stage helical gear sets for high reduction ratios	0	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
5	2	Hardened and ground gears for long service life	1	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
6	2	Modular design — foot, flange, or shaft mount	2	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
7	2	IP55 / IP65 protection class available	3	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
8	2	Compatible with IEC standard motors	4	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
9	2	Viton seals for high-temperature applications	5	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
\.


--
-- Data for Name: web_product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_product_images (id, product_id, image_url, alt_text, display_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: web_product_key_range; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_product_key_range (id, product_id, label, display_order, created_at, updated_at) FROM stdin;
4	2	Output speed: 5–415 r/min	0	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
5	2	Power range: 0.12–160 kW	1	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
6	2	Rated output torque: 85–18,000 N·m	2	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
\.


--
-- Data for Name: web_product_model_range_rows; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_product_model_range_rows (id, product_id, cells, display_order, created_at, updated_at) FROM stdin;
4	2	{SHR17,R17,"85 N·m",Ø20}	0	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
5	2	{SHR27,R27,"130 N·m",Ø25}	1	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
6	2	{SHR37,R37,"200 N·m",Ø25}	2	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
7	2	{SHR47,R47,"300 N·m",Ø30}	3	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
8	2	{SHR57,R57,"450 N·m",Ø35}	4	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
9	2	{SHR67,R67,"600 N·m",Ø35}	5	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
10	2	{SHR77,R77,"820 N·m",Ø40}	6	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
11	2	{SHR87,R87,"1,550 N·m",Ø50}	7	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
12	2	{SHR97,R97,"3,000 N·m",Ø60}	8	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
13	2	{SHR107,R107,"4,300 N·m",Ø70}	9	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
14	2	{SHR137,R137,"8,000 N·m",Ø90}	10	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
15	2	{SHR147,R147,"13,000 N·m",Ø110}	11	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
16	2	{SHR167,R167,"18,000 N·m",Ø120}	12	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
\.


--
-- Data for Name: web_product_mounting_variant_features; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_product_mounting_variant_features (id, variant_id, text, display_order, created_at, updated_at) FROM stdin;
53	15	Inline Helical Transmission	0	2026-08-08 19:48:06.681583+00	2026-08-08 19:48:06.681583+00
54	15	High Torque Capacity	1	2026-08-08 19:48:06.681583+00	2026-08-08 19:48:06.681583+00
55	15	Flexible Motor Options	2	2026-08-08 19:48:06.681583+00	2026-08-08 19:48:06.681583+00
56	15	Robust Cast Iron Housing	3	2026-08-08 19:48:06.681583+00	2026-08-08 19:48:06.681583+00
\.


--
-- Data for Name: web_product_mounting_variants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_product_mounting_variants (id, product_id, name, image_url, display_order, created_at, updated_at) FROM stdin;
15	2	R Foot-Mounted Reducer	/objects/uploads/718ad158-caa1-48e8-a1f7-1054edbb6d99	0	2026-08-08 19:48:06.679306+00	2026-08-08 19:48:06.679306+00
\.


--
-- Data for Name: web_product_related; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_product_related (id, product_id, related_product_id, display_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: web_product_spec_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_product_spec_groups (id, product_id, group_name, display_order, created_at, updated_at) FROM stdin;
2	2	Specifications	0	2026-08-08 15:15:02.743286+00	2026-08-08 15:15:02.743286+00
\.


--
-- Data for Name: web_product_specs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_product_specs (id, group_id, label, value, display_order, created_at, updated_at) FROM stdin;
4	2	Product Type	Inline helical gear reducer	0	2026-08-08 15:15:23.932612+00	2026-08-08 15:15:23.932612+00
5	2	Model Range	R17–R167 / SHR17–SHR167	1	2026-08-08 15:15:23.932612+00	2026-08-08 15:15:23.932612+00
6	2	Output Speed	5–415 r/min	2	2026-08-08 15:15:23.932612+00	2026-08-08 15:15:23.932612+00
7	2	Power Range	0.12–160 kW	3	2026-08-08 15:15:23.932612+00	2026-08-08 15:15:23.932612+00
8	2	Rated Output Torque	85–18,000 N·m	4	2026-08-08 15:15:23.932612+00	2026-08-08 15:15:23.932612+00
9	2	Output Shaft	Ø20–Ø120	5	2026-08-08 15:15:23.932612+00	2026-08-08 15:15:23.932612+00
10	2	Mounting Form	Foot-mounted / flange-mounted	6	2026-08-08 15:15:23.932612+00	2026-08-08 15:15:23.932612+00
11	2	Input Form	Direct motor / shaft input / flange input / motor adapter	7	2026-08-08 15:15:23.932612+00	2026-08-08 15:15:23.932612+00
12	2	Motor Options	Standard / brake / VFD / multi-speed	8	2026-08-08 15:15:23.932612+00	2026-08-08 15:15:23.932612+00
\.


--
-- Data for Name: web_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.web_products (id, category_id, name, slug, series, tagline, description, main_image_url, description_image_url, description_title, doc_url, video_url, status, featured, display_order, seo_title, seo_description, seo_keywords, og_image_url, created_at, updated_at, model_range_headers) FROM stdin;
2	1	R Series Helical Gear Reducer	r-series-helical-gear-reducer	R/F/K/S Series	Inline helical reducer for shaft-aligned industrial drives, conveyors, process equipment, and OEM machinery.	The R Series helical gear reducer is an inline, shaft-mounted power transmission solution engineered for demanding industrial environments. With up to 4 helical gear stages, it delivers exceptional efficiency and quiet operation across a wide torque range.	/objects/uploads/718ad158-caa1-48e8-a1f7-1054edbb6d99	/objects/uploads/67919c07-dfeb-464b-93df-3d4a5831e1e3	RF Flange-Mounted Helical Reducer	https://starshinedrives.com/wp-content/uploads/2026/05/rfks-series-gear-speed-reducer-manual-2024.pdf	\N	published	t	0	R Series Helical Gear Reducer | Starshine Drive	Inline helical gear reducer with output torque 85-18,000 N·m and power range 0.12-160 kW. Foot, flange, and shaft mounting options.	helical gear reducer, R series, inline gear reducer	\N	2026-08-08 15:14:31.178743+00	2026-08-08 19:47:52.678+00	{"Current Series","Previous Type","Rated Output Torque","Output Shaft"}
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 3, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 1, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 5, true);


--
-- Name: email_campaign_recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_campaign_recipients_id_seq', 1, false);


--
-- Name: email_campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_campaigns_id_seq', 1, false);


--
-- Name: email_sender_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_sender_accounts_id_seq', 1, false);


--
-- Name: inquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inquiries_id_seq', 4, true);


--
-- Name: product_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_stock_id_seq', 1, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 1, true);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchases_id_seq', 2, true);


--
-- Name: quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quotations_id_seq', 4, true);


--
-- Name: sales_executives_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_executives_id_seq', 1, true);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_id_seq', 2, true);


--
-- Name: seller_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seller_settings_id_seq', 1, true);


--
-- Name: staff_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staff_roles_id_seq', 3, true);


--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_adjustments_id_seq', 2, true);


--
-- Name: stock_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_history_id_seq', 8, true);


--
-- Name: sub_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sub_groups_id_seq', 1, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, true);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 1, true);


--
-- Name: web_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_categories_id_seq', 4, true);


--
-- Name: web_media_library_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_media_library_id_seq', 9, true);


--
-- Name: web_product_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_product_applications_id_seq', 20, true);


--
-- Name: web_product_config_input_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_product_config_input_types_id_seq', 9, true);


--
-- Name: web_product_faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_product_faqs_id_seq', 18, true);


--
-- Name: web_product_features_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_product_features_id_seq', 15, true);


--
-- Name: web_product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_product_images_id_seq', 1, true);


--
-- Name: web_product_key_range_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_product_key_range_id_seq', 9, true);


--
-- Name: web_product_model_range_rows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_product_model_range_rows_id_seq', 29, true);


--
-- Name: web_product_mounting_variant_features_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_product_mounting_variant_features_id_seq', 56, true);


--
-- Name: web_product_mounting_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_product_mounting_variants_id_seq', 15, true);


--
-- Name: web_product_related_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_product_related_id_seq', 1, false);


--
-- Name: web_product_spec_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_product_spec_groups_id_seq', 3, true);


--
-- Name: web_product_specs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_product_specs_id_seq', 21, true);


--
-- Name: web_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.web_products_id_seq', 3, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: email_campaign_recipients email_campaign_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaign_recipients
    ADD CONSTRAINT email_campaign_recipients_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns email_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_pkey PRIMARY KEY (id);


--
-- Name: email_sender_accounts email_sender_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_sender_accounts
    ADD CONSTRAINT email_sender_accounts_pkey PRIMARY KEY (id);


--
-- Name: inquiries inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_pkey PRIMARY KEY (id);


--
-- Name: product_stock product_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock
    ADD CONSTRAINT product_stock_pkey PRIMARY KEY (id);


--
-- Name: product_stock product_stock_product_warehouse_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock
    ADD CONSTRAINT product_stock_product_warehouse_unique UNIQUE (product_id, warehouse_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_product_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_product_code_unique UNIQUE (product_code);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_purchase_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_purchase_number_unique UNIQUE (purchase_number);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_quotation_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_quotation_number_unique UNIQUE (quotation_number);


--
-- Name: sales_executives sales_executives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_executives
    ADD CONSTRAINT sales_executives_pkey PRIMARY KEY (id);


--
-- Name: sales sales_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: seller_settings seller_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_settings
    ADD CONSTRAINT seller_settings_pkey PRIMARY KEY (id);


--
-- Name: staff_roles staff_roles_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_roles
    ADD CONSTRAINT staff_roles_email_unique UNIQUE (email);


--
-- Name: staff_roles staff_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_roles
    ADD CONSTRAINT staff_roles_pkey PRIMARY KEY (id);


--
-- Name: stock_adjustments stock_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id);


--
-- Name: stock_history stock_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_history
    ADD CONSTRAINT stock_history_pkey PRIMARY KEY (id);


--
-- Name: sub_groups sub_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_groups
    ADD CONSTRAINT sub_groups_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: web_categories web_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_categories
    ADD CONSTRAINT web_categories_pkey PRIMARY KEY (id);


--
-- Name: web_categories web_categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_categories
    ADD CONSTRAINT web_categories_slug_unique UNIQUE (slug);


--
-- Name: web_media_library web_media_library_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_media_library
    ADD CONSTRAINT web_media_library_pkey PRIMARY KEY (id);


--
-- Name: web_product_applications web_product_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_applications
    ADD CONSTRAINT web_product_applications_pkey PRIMARY KEY (id);


--
-- Name: web_product_config_input_types web_product_config_input_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_config_input_types
    ADD CONSTRAINT web_product_config_input_types_pkey PRIMARY KEY (id);


--
-- Name: web_product_faqs web_product_faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_faqs
    ADD CONSTRAINT web_product_faqs_pkey PRIMARY KEY (id);


--
-- Name: web_product_features web_product_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_features
    ADD CONSTRAINT web_product_features_pkey PRIMARY KEY (id);


--
-- Name: web_product_images web_product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_images
    ADD CONSTRAINT web_product_images_pkey PRIMARY KEY (id);


--
-- Name: web_product_key_range web_product_key_range_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_key_range
    ADD CONSTRAINT web_product_key_range_pkey PRIMARY KEY (id);


--
-- Name: web_product_model_range_rows web_product_model_range_rows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_model_range_rows
    ADD CONSTRAINT web_product_model_range_rows_pkey PRIMARY KEY (id);


--
-- Name: web_product_mounting_variant_features web_product_mounting_variant_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_mounting_variant_features
    ADD CONSTRAINT web_product_mounting_variant_features_pkey PRIMARY KEY (id);


--
-- Name: web_product_mounting_variants web_product_mounting_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_mounting_variants
    ADD CONSTRAINT web_product_mounting_variants_pkey PRIMARY KEY (id);


--
-- Name: web_product_related web_product_related_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_related
    ADD CONSTRAINT web_product_related_pkey PRIMARY KEY (id);


--
-- Name: web_product_related web_product_related_product_id_related_product_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_related
    ADD CONSTRAINT web_product_related_product_id_related_product_id_unique UNIQUE (product_id, related_product_id);


--
-- Name: web_product_spec_groups web_product_spec_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_spec_groups
    ADD CONSTRAINT web_product_spec_groups_pkey PRIMARY KEY (id);


--
-- Name: web_product_specs web_product_specs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_specs
    ADD CONSTRAINT web_product_specs_pkey PRIMARY KEY (id);


--
-- Name: web_products web_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_products
    ADD CONSTRAINT web_products_pkey PRIMARY KEY (id);


--
-- Name: web_products web_products_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_products
    ADD CONSTRAINT web_products_slug_unique UNIQUE (slug);


--
-- Name: email_campaign_recipients_campaign_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_campaign_recipients_campaign_id_idx ON public.email_campaign_recipients USING btree (campaign_id);


--
-- Name: email_campaign_recipients_sender_account_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_campaign_recipients_sender_account_id_idx ON public.email_campaign_recipients USING btree (sender_account_id);


--
-- Name: inquiries_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inquiries_customer_id_idx ON public.inquiries USING btree (customer_id);


--
-- Name: product_stock_warehouse_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_stock_warehouse_id_idx ON public.product_stock USING btree (warehouse_id);


--
-- Name: products_barcode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_barcode_idx ON public.products USING btree (barcode);


--
-- Name: products_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_category_id_idx ON public.products USING btree (category_id);


--
-- Name: products_sub_group_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_sub_group_id_idx ON public.products USING btree (sub_group_id);


--
-- Name: purchases_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchases_created_at_idx ON public.purchases USING btree (created_at);


--
-- Name: purchases_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchases_status_idx ON public.purchases USING btree (status);


--
-- Name: purchases_supplier_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchases_supplier_id_idx ON public.purchases USING btree (supplier_id);


--
-- Name: purchases_warehouse_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchases_warehouse_id_idx ON public.purchases USING btree (warehouse_id);


--
-- Name: quotations_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quotations_created_at_idx ON public.quotations USING btree (created_at);


--
-- Name: quotations_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quotations_customer_id_idx ON public.quotations USING btree (customer_id);


--
-- Name: quotations_inquiry_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quotations_inquiry_id_idx ON public.quotations USING btree (inquiry_id);


--
-- Name: quotations_sales_executive_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quotations_sales_executive_id_idx ON public.quotations USING btree (sales_executive_id);


--
-- Name: quotations_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quotations_status_idx ON public.quotations USING btree (status);


--
-- Name: sales_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_created_at_idx ON public.sales USING btree (created_at);


--
-- Name: sales_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_customer_id_idx ON public.sales USING btree (customer_id);


--
-- Name: sales_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_status_idx ON public.sales USING btree (status);


--
-- Name: sales_warehouse_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sales_warehouse_id_idx ON public.sales USING btree (warehouse_id);


--
-- Name: staff_roles_sales_executive_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX staff_roles_sales_executive_id_idx ON public.staff_roles USING btree (sales_executive_id);


--
-- Name: stock_adjustments_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_adjustments_product_id_idx ON public.stock_adjustments USING btree (product_id);


--
-- Name: stock_history_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_history_created_at_idx ON public.stock_history USING btree (created_at);


--
-- Name: stock_history_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_history_product_id_idx ON public.stock_history USING btree (product_id);


--
-- Name: stock_history_warehouse_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_history_warehouse_id_idx ON public.stock_history USING btree (warehouse_id);


--
-- Name: sub_groups_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sub_groups_category_id_idx ON public.sub_groups USING btree (category_id);


--
-- Name: email_campaign_recipients email_campaign_recipients_campaign_id_email_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaign_recipients
    ADD CONSTRAINT email_campaign_recipients_campaign_id_email_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.email_campaigns(id);


--
-- Name: email_campaign_recipients email_campaign_recipients_sender_account_id_email_sender_accoun; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaign_recipients
    ADD CONSTRAINT email_campaign_recipients_sender_account_id_email_sender_accoun FOREIGN KEY (sender_account_id) REFERENCES public.email_sender_accounts(id) ON DELETE SET NULL;


--
-- Name: inquiries inquiries_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: product_stock product_stock_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock
    ADD CONSTRAINT product_stock_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_stock product_stock_warehouse_id_warehouses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock
    ADD CONSTRAINT product_stock_warehouse_id_warehouses_id_fk FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: products products_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_sub_group_id_sub_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sub_group_id_sub_groups_id_fk FOREIGN KEY (sub_group_id) REFERENCES public.sub_groups(id);


--
-- Name: purchases purchases_supplier_id_suppliers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_supplier_id_suppliers_id_fk FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: purchases purchases_warehouse_id_warehouses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_warehouse_id_warehouses_id_fk FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: quotations quotations_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: quotations quotations_inquiry_id_inquiries_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_inquiry_id_inquiries_id_fk FOREIGN KEY (inquiry_id) REFERENCES public.inquiries(id);


--
-- Name: quotations quotations_sales_executive_id_sales_executives_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_sales_executive_id_sales_executives_id_fk FOREIGN KEY (sales_executive_id) REFERENCES public.sales_executives(id);


--
-- Name: sales sales_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: sales sales_warehouse_id_warehouses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_warehouse_id_warehouses_id_fk FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: staff_roles staff_roles_sales_executive_id_sales_executives_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_roles
    ADD CONSTRAINT staff_roles_sales_executive_id_sales_executives_id_fk FOREIGN KEY (sales_executive_id) REFERENCES public.sales_executives(id) ON DELETE SET NULL;


--
-- Name: stock_adjustments stock_adjustments_from_warehouse_id_warehouses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_from_warehouse_id_warehouses_id_fk FOREIGN KEY (from_warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: stock_adjustments stock_adjustments_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_adjustments stock_adjustments_to_warehouse_id_warehouses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_to_warehouse_id_warehouses_id_fk FOREIGN KEY (to_warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: stock_adjustments stock_adjustments_warehouse_id_warehouses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_warehouse_id_warehouses_id_fk FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: stock_history stock_history_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_history
    ADD CONSTRAINT stock_history_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_history stock_history_warehouse_id_warehouses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_history
    ADD CONSTRAINT stock_history_warehouse_id_warehouses_id_fk FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: sub_groups sub_groups_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sub_groups
    ADD CONSTRAINT sub_groups_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: web_product_applications web_product_applications_product_id_web_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_applications
    ADD CONSTRAINT web_product_applications_product_id_web_products_id_fk FOREIGN KEY (product_id) REFERENCES public.web_products(id);


--
-- Name: web_product_config_input_types web_product_config_input_types_product_id_web_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_config_input_types
    ADD CONSTRAINT web_product_config_input_types_product_id_web_products_id_fk FOREIGN KEY (product_id) REFERENCES public.web_products(id);


--
-- Name: web_product_faqs web_product_faqs_product_id_web_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_faqs
    ADD CONSTRAINT web_product_faqs_product_id_web_products_id_fk FOREIGN KEY (product_id) REFERENCES public.web_products(id);


--
-- Name: web_product_features web_product_features_product_id_web_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_features
    ADD CONSTRAINT web_product_features_product_id_web_products_id_fk FOREIGN KEY (product_id) REFERENCES public.web_products(id);


--
-- Name: web_product_images web_product_images_product_id_web_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_images
    ADD CONSTRAINT web_product_images_product_id_web_products_id_fk FOREIGN KEY (product_id) REFERENCES public.web_products(id);


--
-- Name: web_product_key_range web_product_key_range_product_id_web_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_key_range
    ADD CONSTRAINT web_product_key_range_product_id_web_products_id_fk FOREIGN KEY (product_id) REFERENCES public.web_products(id);


--
-- Name: web_product_model_range_rows web_product_model_range_rows_product_id_web_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_model_range_rows
    ADD CONSTRAINT web_product_model_range_rows_product_id_web_products_id_fk FOREIGN KEY (product_id) REFERENCES public.web_products(id);


--
-- Name: web_product_mounting_variant_features web_product_mounting_variant_features_variant_id_web_product_mo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_mounting_variant_features
    ADD CONSTRAINT web_product_mounting_variant_features_variant_id_web_product_mo FOREIGN KEY (variant_id) REFERENCES public.web_product_mounting_variants(id);


--
-- Name: web_product_mounting_variants web_product_mounting_variants_product_id_web_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_mounting_variants
    ADD CONSTRAINT web_product_mounting_variants_product_id_web_products_id_fk FOREIGN KEY (product_id) REFERENCES public.web_products(id);


--
-- Name: web_product_related web_product_related_product_id_web_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_related
    ADD CONSTRAINT web_product_related_product_id_web_products_id_fk FOREIGN KEY (product_id) REFERENCES public.web_products(id);


--
-- Name: web_product_related web_product_related_related_product_id_web_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_related
    ADD CONSTRAINT web_product_related_related_product_id_web_products_id_fk FOREIGN KEY (related_product_id) REFERENCES public.web_products(id);


--
-- Name: web_product_spec_groups web_product_spec_groups_product_id_web_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_spec_groups
    ADD CONSTRAINT web_product_spec_groups_product_id_web_products_id_fk FOREIGN KEY (product_id) REFERENCES public.web_products(id);


--
-- Name: web_product_specs web_product_specs_group_id_web_product_spec_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_product_specs
    ADD CONSTRAINT web_product_specs_group_id_web_product_spec_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.web_product_spec_groups(id);


--
-- Name: web_products web_products_category_id_web_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.web_products
    ADD CONSTRAINT web_products_category_id_web_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.web_categories(id);


--
-- PostgreSQL database dump complete
--

\unrestrict WfRnFoemEXOylPlJnETB2eUlvgLKbWrMYmT19S6n3iTmNSjoYGetRZBC796RQvA

