import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  GraduationCap,
  Plus,
  User,
  X,
} from "lucide-react";
import { getCurrentSession } from "../services/authService";

export default function InfoForm() {
  const navigate = useNavigate();

  const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",

    currentStatus: "Student",
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    cgpa: "",

    company: "",
    currentRole: "",
    yearsOfExperience: "",

    targetRole: "",
    experienceLevel: "Fresher",
    interviewType: "Mixed",
    targetCompany: "",

    primaryLanguage: "Java",
    skillLevel: "Intermediate",
    skills: [],
  });

  const [skillInput, setSkillInput] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  // -------------------------------------------------------
  // LOAD USER + EXISTING PROFILE
  // -------------------------------------------------------

  useEffect(() => {
    const loadProfile = async () => {
      try {
        let session = await getCurrentSession();
        let user = session?.user;

        if (!user) {
          const storedUser = localStorage.getItem("edi-user");

          if (!storedUser) {
            console.log("No authenticated user available.");
            return;
          }

          const parsedUser = JSON.parse(storedUser);

          if (!parsedUser?.id) {
            console.log("User ID not found.");
            return;
          }

          user = parsedUser;
        }

        // Prefill details from authentication
        setFormData((previous) => ({
          ...previous,

          fullName:
            user.user_metadata?.full_name ||
            user.name ||
            previous.fullName,

          email:
            user.email ||
            previous.email,
        }));

        if (!user?.id) {
          console.log("User ID not found.");
          return;
        }

        // Fetch existing profile
        const response = await fetch(
          `${API_URL}/api/profile/${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          console.log(
            data.message || "No existing profile found."
          );
          return;
        }

        if (data.success && data.user) {
          const profile = data.user.profile || {};

          setFormData((previous) => ({
            ...previous,
            ...profile,

            // Prevent invalid skills value
            skills: Array.isArray(profile.skills)
              ? profile.skills
              : previous.skills,
          }));
        }
      } catch (error) {
        console.error(
          "Error loading profile:",
          error
        );
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [API_URL]);

  // -------------------------------------------------------
  // NORMAL INPUT CHANGE
  // -------------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // -------------------------------------------------------
  // ADD SKILL
  // -------------------------------------------------------

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    const alreadyExists = formData.skills.some(
      (item) =>
        item.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      skills: [...previous.skills, skill],
    }));

    setSkillInput("");
  };

  // -------------------------------------------------------
  // REMOVE SKILL
  // -------------------------------------------------------

  const removeSkill = (skillToRemove) => {
    setFormData((previous) => ({
      ...previous,

      skills: previous.skills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  // -------------------------------------------------------
  // ADD SKILL WITH ENTER
  // -------------------------------------------------------

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  // -------------------------------------------------------
  // RESUME
  // -------------------------------------------------------

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please upload a PDF, DOC, or DOCX file."
      );

      event.target.value = "";
      setResume(null);

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Resume must be smaller than 5 MB."
      );

      event.target.value = "";
      setResume(null);

      return;
    }

    setResume(file);
  };

  // -------------------------------------------------------
  // SUBMIT PROFILE
  // -------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      const session = await getCurrentSession();
      let user = session?.user;

      if (!user) {
        const storedUser =
          localStorage.getItem("edi-user");

        if (!storedUser) {
          throw new Error(
            "User not found. Please login again."
          );
        }

        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser?.id) {
          throw new Error(
            "User ID not found. Please login again."
          );
        }

        user = parsedUser;
      }

      // -----------------------------------------------
      // SAVE PROFILE
      // -----------------------------------------------

      const response = await fetch(
        `${API_URL}/api/profile`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            id: user.id,
            profile: formData,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to save profile."
        );
      }

      // -----------------------------------------------
      // RESUME
      // -----------------------------------------------

      /*
       * Currently we only keep the selected resume
       * on the frontend.
       *
       * Later you should upload it through:
       *
       * POST /api/resume/upload
       *
       * using FormData.
       */

      if (resume) {
        console.log(
          "Selected resume:",
          resume.name
        );
      }

      // -----------------------------------------------
      // UPDATE LOCAL STORAGE
      // -----------------------------------------------

      const updatedUser = {
        ...user,
        profile_completed: true,
      };

      localStorage.setItem(
        "edi-user",
        JSON.stringify(updatedUser)
      );

      alert("Profile saved successfully!");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Profile save error:",
        error
      );

      alert(
        error.message ||
          "Unable to save your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // LOADING
  // -------------------------------------------------------

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="text-sm text-slate-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-indigo-600">
            Interview Assistant
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Complete Your Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Tell us about yourself so we can personalize
            your interview preparation and recommendations.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ================================================= */}
          {/* PERSONAL INFORMATION */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <User size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Personal Information
                </h2>

                <p className="text-sm text-slate-500">
                  Basic information about you.
                </p>
              </div>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* NAME */}

              <div>
                <label className={labelClass}>
                  Full Name *
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={inputClass}
                  required
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className={labelClass}>
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClass}
                  required
                />
              </div>

              {/* PHONE */}

              <div>
                <label className={labelClass}>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
              </div>

              {/* LOCATION */}

              <div>
                <label className={labelClass}>
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Pune, Maharashtra"
                  className={inputClass}
                />
              </div>

            </div>
          </section>

          {/* ================================================= */}
          {/* EDUCATION / EXPERIENCE */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <GraduationCap size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Education & Experience
                </h2>

                <p className="text-sm text-slate-500">
                  Tell us where you currently are in
                  your career.
                </p>
              </div>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* STATUS */}

              <div>
                <label className={labelClass}>
                  Current Status *
                </label>

                <select
                  name="currentStatus"
                  value={formData.currentStatus}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Student">
                    Student
                  </option>

                  <option value="Graduate">
                    Graduate
                  </option>

                  <option value="Working Professional">
                    Working Professional
                  </option>
                </select>
              </div>

              {/* STUDENT / GRADUATE */}

              {formData.currentStatus === "Student" ||
              formData.currentStatus === "Graduate" ? (
                <>

                  <div>
                    <label className={labelClass}>
                      College / University
                    </label>

                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="College or university"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Degree
                    </label>

                    <input
                      type="text"
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      placeholder="e.g. B.Tech"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Branch / Specialization
                    </label>

                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="e.g. Computer Engineering"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Graduation Year
                    </label>

                    <input
                      type="number"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      placeholder="2028"
                      min="2000"
                      max="2050"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      CGPA / Percentage
                    </label>

                    <input
                      type="text"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleChange}
                      placeholder="e.g. 8.5"
                      className={inputClass}
                    />
                  </div>

                </>
              ) : (
                <>

                  {/* PROFESSIONAL */}

                  <div>
                    <label className={labelClass}>
                      Company
                    </label>

                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Current company"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Current Role
                    </label>

                    <input
                      type="text"
                      name="currentRole"
                      value={formData.currentRole}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Years of Experience
                    </label>

                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      min="0"
                      step="0.5"
                      placeholder="2"
                      className={inputClass}
                    />
                  </div>

                </>
              )}

            </div>
          </section>

          {/* ================================================= */}
          {/* INTERVIEW GOAL */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <BriefcaseBusiness size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Interview Goal
                </h2>

                <p className="text-sm text-slate-500">
                  Help us understand what you're
                  preparing for.
                </p>
              </div>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* TARGET ROLE */}

              <div>
                <label className={labelClass}>
                  Target Role *
                </label>

                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack Developer"
                  className={inputClass}
                  required
                />
              </div>

              {/* EXPERIENCE */}

              <div>
                <label className={labelClass}>
                  Experience Level *
                </label>

                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Fresher">
                    Fresher
                  </option>

                  <option value="Entry Level">
                    Entry Level
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Experienced">
                    Experienced
                  </option>
                </select>
              </div>

              {/* INTERVIEW TYPE */}

              <div>
                <label className={labelClass}>
                  Interview Type *
                </label>

                <select
                  name="interviewType"
                  value={formData.interviewType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Mixed">
                    Mixed
                  </option>

                  <option value="Technical">
                    Technical
                  </option>

                  <option value="Coding">
                    Coding
                  </option>

                  <option value="HR">
                    HR
                  </option>

                  <option value="Behavioral">
                    Behavioral
                  </option>

                  <option value="System Design">
                    System Design
                  </option>
                </select>
              </div>

              {/* TARGET COMPANY */}

              <div>
                <label className={labelClass}>
                  Target Company
                </label>

                <input
                  type="text"
                  name="targetCompany"
                  value={formData.targetCompany}
                  onChange={handleChange}
                  placeholder="e.g. Google"
                  className={inputClass}
                />
              </div>

            </div>
          </section>

          {/* ================================================= */}
          {/* SKILLS */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-1 text-lg font-semibold text-slate-900">
              Skills & Technologies
            </h2>

            <p className="mb-6 text-sm text-slate-500">
              Add technologies you want interview
              questions based on.
            </p>

            <div className="grid gap-5 md:grid-cols-2">

              {/* LANGUAGE */}

              <div>
                <label className={labelClass}>
                  Primary Programming Language
                </label>

                <select
                  name="primaryLanguage"
                  value={formData.primaryLanguage}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                  <option value="C++">C++</option>
                  <option value="JavaScript">
                    JavaScript
                  </option>
                  <option value="TypeScript">
                    TypeScript
                  </option>
                  <option value="C">C</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* SKILL LEVEL */}

              <div>
                <label className={labelClass}>
                  Skill Level
                </label>

                <select
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Beginner">
                    Beginner
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Advanced">
                    Advanced
                  </option>
                </select>
              </div>

            </div>

            {/* SKILL INPUT */}

            <div className="mt-5">

              <label className={labelClass}>
                Skills
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">

                <input
                  type="text"
                  value={skillInput}
                  onChange={(event) =>
                    setSkillInput(event.target.value)
                  }
                  onKeyDown={handleSkillKeyDown}
                  placeholder="React, Java, Node.js..."
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={addSkill}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Plus size={18} />
                  Add
                </button>

              </div>

              {/* SKILL TAGS */}

              {formData.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">

                  {formData.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                    >
                      {skill}

                      <button
                        type="button"
                        onClick={() =>
                          removeSkill(skill)
                        }
                        className="text-indigo-400 transition hover:text-indigo-700"
                        aria-label={`Remove ${skill}`}
                      >
                        <X size={15} />
                      </button>

                    </div>
                  ))}

                </div>
              )}

            </div>
          </section>

          {/* ================================================= */}
          {/* RESUME */}
          {/* ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <FileText size={22} />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Resume
                </h2>

                <p className="text-sm text-slate-500">
                  Upload your resume for personalized
                  interview questions.
                </p>

              </div>

            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-6 py-10 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40">

              <FileText
                className="mb-3 text-slate-400"
                size={34}
              />

              <span className="font-medium text-slate-800">
                {resume
                  ? resume.name
                  : "Choose your resume"}
              </span>

              <span className="mt-1 text-sm text-slate-500">
                PDF, DOC or DOCX • Maximum 5 MB
              </span>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                className="hidden"
              />

            </label>

            {/* SELECTED FILE */}

            {resume && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">

                <div className="flex items-center gap-2">

                  <CheckCircle2
                    size={18}
                    className="text-green-600"
                  />

                  <div>

                    <p className="text-sm font-medium text-green-800">
                      {resume.name}
                    </p>

                    <p className="text-xs text-green-600">
                      {(resume.size / 1024 / 1024).toFixed(
                        2
                      )}{" "}
                      MB
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => setResume(null)}
                  className="rounded-lg p-2 text-green-700 transition hover:bg-green-100"
                  aria-label="Remove resume"
                >
                  <X size={17} />
                </button>

              </div>
            )}

          </section>

          {/* ================================================= */}
          {/* SUBMIT */}
          {/* ================================================= */}

          <div className="flex flex-col-reverse items-center justify-between gap-4 pb-10 sm:flex-row">

            <p className="text-sm text-slate-500">
              You can update these details later from
              settings.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >

              <CheckCircle2 size={19} />

              {loading
                ? "Saving..."
                : "Complete Profile"}

            </button>

          </div>

        </form>
      </div>
    </div>
  );
}