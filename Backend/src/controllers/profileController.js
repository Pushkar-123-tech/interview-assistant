import { supabase } from "../utils/supabase.js";

// =====================================================
// GET USER PROFILE
// GET /api/profile/:id
// =====================================================

export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }

    // Get basic user information
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email, profile_completed")
      .eq("id", id)
      .single();

    if (userError) {
      return res.status(400).json({
        success: false,
        message: userError.message,
      });
    }

    // Get profile information
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", id)
      .maybeSingle();

    if (profileError) {
      return res.status(400).json({
        success: false,
        message: profileError.message,
      });
    }

    // Convert database snake_case -> frontend camelCase
    const formattedProfile = profile
      ? {
          fullName: profile.full_name || user.name || "",
          email: user.email || "",
          phone: profile.phone || "",
          location: profile.location || "",

          currentStatus: profile.current_status || "Student",

          college: profile.college || "",
          degree: profile.degree || "",
          branch: profile.branch || "",
          graduationYear: profile.graduation_year || "",
          cgpa: profile.cgpa || "",

          company: profile.company || "",
          currentRole: profile.job_role || "",
          yearsOfExperience: profile.years_of_experience || "",

          targetRole: profile.target_role || "",
          experienceLevel: profile.experience_level || "Fresher",
          interviewType: profile.interview_type || "Mixed",
          targetCompany: profile.target_company || "",

          primaryLanguage: profile.primary_language || "Java",
          skillLevel: profile.skill_level || "Intermediate",
          skills: profile.skills || [],
        }
      : {};

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        profile: formattedProfile,
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =====================================================
// CREATE / UPDATE PROFILE
// POST /api/profile
// =====================================================

export const upsertProfile = async (req, res) => {
  try {
    const { id, profile } = req.body;

    if (!id || !profile) {
      return res.status(400).json({
        success: false,
        message: "id and profile are required",
      });
    }

    const payload = {
      user_id: id,

      full_name: profile.fullName || null,
      phone: profile.phone || null,
      location: profile.location || null,

      current_status: profile.currentStatus || null,

      college: profile.college || null,
      degree: profile.degree || null,
      branch: profile.branch || null,

      graduation_year: profile.graduationYear
        ? Number(profile.graduationYear)
        : null,

      cgpa: profile.cgpa || null,

      company: profile.company || null,
      job_role: profile.currentRole || null,

      years_of_experience:
        profile.yearsOfExperience !== "" &&
        profile.yearsOfExperience != null
          ? Number(profile.yearsOfExperience)
          : null,

      target_role: profile.targetRole || null,
      experience_level: profile.experienceLevel || null,
      interview_type: profile.interviewType || null,
      target_company: profile.targetCompany || null,

      primary_language: profile.primaryLanguage || null,
      skill_level: profile.skillLevel || null,

      skills: Array.isArray(profile.skills)
        ? profile.skills
        : [],

      updated_at: new Date().toISOString(),
    };

    // Ensure a user row exists for the foreign key.
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (existingUserError) {
      console.error("User lookup error:", existingUserError);

      return res.status(400).json({
        success: false,
        message: existingUserError.message,
      });
    }

    if (!existingUser) {
      const { error: createUserError } = await supabase
        .from("users")
        .insert({
          id,
          name: profile.fullName || null,
          email: profile.email || null,
          profile_completed: true,
        });

      if (createUserError) {
        console.error("User create error:", createUserError);

        return res.status(400).json({
          success: false,
          message: createUserError.message,
        });
      }
    }

    // Insert profile if it doesn't exist,
    // update it if user_id already exists
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(payload, {
        onConflict: "user_id",
      })
      .select()
      .single();

    if (error) {
      console.error("Profile upsert error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Optional: mark onboarding complete in users
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        profile_completed: true,
      })
      .eq("id", id);

    if (userUpdateError) {
      console.error(
        "Profile completed update error:",
        userUpdateError
      );
    }

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      profile: data,
    });
  } catch (err) {
    console.error("Profile save error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};