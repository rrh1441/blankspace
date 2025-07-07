

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


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."subscription_status_enum" AS ENUM (
    'active',
    'canceled',
    'past_due',
    'incomplete',
    'trialing'
);


ALTER TYPE "public"."subscription_status_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_story_credits"("user_id_to_update" "uuid", "credits_to_add" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.users
  SET story_credits = story_credits + credits_to_add
  WHERE id = user_id_to_update;
END;
$$;


ALTER FUNCTION "public"."add_story_credits"("user_id_to_update" "uuid", "credits_to_add" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- Insert a row into public.users
  insert into public.users (id, email, name, monthly_minutes_limit, subscription_status, minutes_used_this_period)
  values (
    new.id,                         -- Use the user ID from auth.users
    new.email,                      -- Use the email from auth.users
    new.raw_user_meta_data ->> 'name', -- Extract 'name' from metadata passed during signup
    3,                              -- Set free tier minute limit
    'free',                         -- Set free tier status
    0                               -- Initialize used minutes to 0
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_minutes_used"("p_uid" "uuid", "p_inc" integer) RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  UPDATE public.users
  SET    minutes_used_this_period = minutes_used_this_period + p_inc
  WHERE  id = p_uid;
$$;


ALTER FUNCTION "public"."increment_minutes_used"("p_uid" "uuid", "p_inc" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."moddatetime"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."moddatetime"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."book_pages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "book_id" "uuid" NOT NULL,
    "page_number" integer NOT NULL,
    "text_content" "text",
    "edited_text_content" "text",
    "image_prompt" "text",
    "image_url" "text",
    "image_generation_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."book_pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "creation_workflow" "text" DEFAULT 'book_creator'::"text" NOT NULL,
    "title" "text",
    "selected_style" "text" NOT NULL,
    "hero_name" "text",
    "hero_description" "text",
    "hero_reference_image_path" "text",
    "hero_reference_image_uploaded_at" timestamp with time zone,
    "approved_character_image_url" "text",
    "approved_character_details" "jsonb",
    "theme" "text",
    "educational_focus" "text",
    "additional_instructions" "text",
    "reading_level" "text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."books" OWNER TO "postgres";


COMMENT ON COLUMN "public"."books"."status" IS 'Workflow status: draft -> character_approved -> story_written -> generating_assets -> completed/error';



CREATE TABLE IF NOT EXISTS "public"."free_story_usage" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "text" NOT NULL,
    "ip_address" "text",
    "used" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."free_story_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text",
    "content" "text",
    "theme" "text",
    "language" "text",
    "length_minutes" integer,
    "main_character" "text",
    "educational_focus" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "audio_url" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."stories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."story_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "path" "text" NOT NULL,
    "title" "text",
    "voice" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."story_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."story_readings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "voice_profile_id" "uuid",
    "elevenlabs_professional_voice_id" "text",
    "audio_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "duration" integer
);


ALTER TABLE "public"."story_readings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."story_usage" (
    "session_id" "text" NOT NULL,
    "ip" "text",
    "used" boolean DEFAULT true NOT NULL,
    "used_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_generated_at" timestamp with time zone
);


ALTER TABLE "public"."story_usage" OWNER TO "postgres";


COMMENT ON COLUMN "public"."story_usage"."last_generated_at" IS 'Timestamp when the anonymous free story text was generated, used to check eligibility for free audio generation.';



CREATE TABLE IF NOT EXISTS "public"."storybook_pages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "storybook_id" "uuid" NOT NULL,
    "page_number" integer NOT NULL,
    "text" "text",
    "image_prompt" "text",
    "image_url" "text",
    "image_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."storybook_pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storybooks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "title" "text",
    "theme" "text" NOT NULL,
    "main_character" "text",
    "educational_focus" "text",
    "reference_image_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."storybooks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "subscription_tier" "text",
    "stripe_customer_id" "text",
    "subscription_status" "text",
    "active_plan_price_id" "text",
    "subscription_current_period_end" timestamp with time zone,
    "story_credits" integer DEFAULT 0 NOT NULL,
    "monthly_minutes_limit" integer DEFAULT 60 NOT NULL,
    "minutes_used_this_period" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."voice_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text",
    "elevenlabs_voice_id" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "is_default" boolean DEFAULT false
);


ALTER TABLE "public"."voice_profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."book_pages"
    ADD CONSTRAINT "book_pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."free_story_usage"
    ADD CONSTRAINT "free_story_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."free_story_usage"
    ADD CONSTRAINT "free_story_usage_session_id_key" UNIQUE ("session_id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_assets"
    ADD CONSTRAINT "story_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_readings"
    ADD CONSTRAINT "story_readings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_usage"
    ADD CONSTRAINT "story_usage_pkey" PRIMARY KEY ("session_id");



ALTER TABLE ONLY "public"."storybook_pages"
    ADD CONSTRAINT "storybook_pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storybook_pages"
    ADD CONSTRAINT "storybook_pages_unique_page_number" UNIQUE ("storybook_id", "page_number");



ALTER TABLE ONLY "public"."storybooks"
    ADD CONSTRAINT "storybooks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."book_pages"
    ADD CONSTRAINT "unique_book_page" UNIQUE ("book_id", "page_number");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_stripe_customer_id_key" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."voice_profiles"
    ADD CONSTRAINT "voice_profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_book_pages_book_id" ON "public"."book_pages" USING "btree" ("book_id");



CREATE INDEX "idx_book_pages_image_status" ON "public"."book_pages" USING "btree" ("image_generation_status");



CREATE INDEX "idx_books_status" ON "public"."books" USING "btree" ("status");



CREATE INDEX "idx_books_user_id" ON "public"."books" USING "btree" ("user_id");



CREATE INDEX "idx_story_readings_story_id" ON "public"."story_readings" USING "btree" ("story_id");



CREATE INDEX "idx_story_readings_voice_profile_id" ON "public"."story_readings" USING "btree" ("voice_profile_id");



CREATE INDEX "idx_storybook_pages_storybook_id" ON "public"."storybook_pages" USING "btree" ("storybook_id");



CREATE INDEX "idx_storybooks_user_id" ON "public"."storybooks" USING "btree" ("user_id");



CREATE INDEX "idx_users_stripe_customer_id" ON "public"."users" USING "btree" ("stripe_customer_id");



CREATE INDEX "idx_voice_profiles_user_id" ON "public"."voice_profiles" USING "btree" ("user_id");



CREATE INDEX "story_assets_user_idx" ON "public"."story_assets" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "on_storybook_pages_update" BEFORE UPDATE ON "public"."storybook_pages" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_storybooks_update" BEFORE UPDATE ON "public"."storybooks" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_on_stories" BEFORE UPDATE ON "public"."stories" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"();



ALTER TABLE ONLY "public"."book_pages"
    ADD CONSTRAINT "book_pages_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_readings"
    ADD CONSTRAINT "story_readings_voice_profile_id_fkey" FOREIGN KEY ("voice_profile_id") REFERENCES "public"."voice_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."storybook_pages"
    ADD CONSTRAINT "storybook_pages_storybook_id_fkey" FOREIGN KEY ("storybook_id") REFERENCES "public"."storybooks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storybooks"
    ADD CONSTRAINT "storybooks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."voice_profiles"
    ADD CONSTRAINT "voice_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow DELETE for own book pages" ON "public"."book_pages" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."books" "b"
  WHERE (("b"."id" = "book_pages"."book_id") AND ("b"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow DELETE for own books" ON "public"."books" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow INSERT for own book pages" ON "public"."book_pages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."books" "b"
  WHERE (("b"."id" = "book_pages"."book_id") AND ("b"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow INSERT for own books" ON "public"."books" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow SELECT for own book pages" ON "public"."book_pages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."books" "b"
  WHERE (("b"."id" = "book_pages"."book_id") AND ("b"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow SELECT for own books" ON "public"."books" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow UPDATE for own book pages" ON "public"."book_pages" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."books" "b"
  WHERE (("b"."id" = "book_pages"."book_id") AND ("b"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."books" "b"
  WHERE (("b"."id" = "book_pages"."book_id") AND ("b"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow UPDATE for own books" ON "public"."books" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow authenticated users to select their own stories" ON "public"."stories" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow service_role full access to story_usage" ON "public"."story_usage" TO "service_role", "supabase_admin" USING (true) WITH CHECK (true);



CREATE POLICY "Allow users to manage own voice profiles" ON "public"."voice_profiles" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to manage pages for their storybooks" ON "public"."storybook_pages" USING ((EXISTS ( SELECT 1
   FROM "public"."storybooks" "sb"
  WHERE (("sb"."id" = "storybook_pages"."storybook_id") AND ("sb"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."storybooks" "sb"
  WHERE (("sb"."id" = "storybook_pages"."storybook_id") AND ("sb"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow users to manage their own storybooks" ON "public"."storybooks" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to see own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Allow users to select pages for their storybooks" ON "public"."storybook_pages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."storybooks" "sb"
  WHERE (("sb"."id" = "storybook_pages"."storybook_id") AND ("sb"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow users to update own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can manage own stories" ON "public"."stories" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own row" ON "public"."users" FOR SELECT USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."book_pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read_own_user_row" ON "public"."users" FOR SELECT USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."stories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_readings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_usage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storybook_pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storybooks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."voice_profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."add_story_credits"("user_id_to_update" "uuid", "credits_to_add" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."add_story_credits"("user_id_to_update" "uuid", "credits_to_add" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_story_credits"("user_id_to_update" "uuid", "credits_to_add" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_minutes_used"("p_uid" "uuid", "p_inc" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."increment_minutes_used"("p_uid" "uuid", "p_inc" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_minutes_used"("p_uid" "uuid", "p_inc" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."moddatetime"() TO "anon";
GRANT ALL ON FUNCTION "public"."moddatetime"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."moddatetime"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."book_pages" TO "anon";
GRANT ALL ON TABLE "public"."book_pages" TO "authenticated";
GRANT ALL ON TABLE "public"."book_pages" TO "service_role";



GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";



GRANT ALL ON TABLE "public"."free_story_usage" TO "anon";
GRANT ALL ON TABLE "public"."free_story_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."free_story_usage" TO "service_role";



GRANT ALL ON TABLE "public"."stories" TO "anon";
GRANT ALL ON TABLE "public"."stories" TO "authenticated";
GRANT ALL ON TABLE "public"."stories" TO "service_role";



GRANT ALL ON TABLE "public"."story_assets" TO "anon";
GRANT ALL ON TABLE "public"."story_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."story_assets" TO "service_role";



GRANT ALL ON TABLE "public"."story_readings" TO "anon";
GRANT ALL ON TABLE "public"."story_readings" TO "authenticated";
GRANT ALL ON TABLE "public"."story_readings" TO "service_role";



GRANT ALL ON TABLE "public"."story_usage" TO "anon";
GRANT ALL ON TABLE "public"."story_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."story_usage" TO "service_role";



GRANT ALL ON TABLE "public"."storybook_pages" TO "anon";
GRANT ALL ON TABLE "public"."storybook_pages" TO "authenticated";
GRANT ALL ON TABLE "public"."storybook_pages" TO "service_role";



GRANT ALL ON TABLE "public"."storybooks" TO "anon";
GRANT ALL ON TABLE "public"."storybooks" TO "authenticated";
GRANT ALL ON TABLE "public"."storybooks" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."voice_profiles" TO "anon";
GRANT ALL ON TABLE "public"."voice_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."voice_profiles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
