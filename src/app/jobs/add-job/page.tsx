"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import Image from "next/image";
import { useContext } from "react";
import { SidebarContext } from "@/components/sidebar";
import { FiUpload } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa6";
import Link from "next/link";
import LexicalEditor from "@/components/LexicalEditor";
import { createClient } from "@/utils/supabase/client";
import { getSignedURL } from "@/app/jobs/actions"; 

const steps = ["Company", "Job Details", "Job Description"];

const computeChecksum = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const hashBuffer = crypto.subtle.digest("SHA-256", arrayBuffer);
        hashBuffer.then((hash) => {
          const hashArray = Array.from(new Uint8Array(hash));
          const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
          resolve(hashHex);
        }).catch(reject);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export default function AddJob() {
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [jobMetadata, setJobMetadata] = useState({
    jobTitle: "",
    jobType: "",
    jobLocationType: "",
    jobLocation: "",
    workingType: "",
    experience: { min: "", max: "" },
    salary: { min: "", max: "" },
  });
  const [jobDescription, setJobDescription] = useState("");

  const router = useRouter();
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("No sidebar context found");
  }
  const { collapsed } = context;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCompanyLogo(e.target.files[0]);
    }
  };

  const handleUploadLogo = async (file: File) => {
      const checksum = await computeChecksum(file);
      const signedURL = await getSignedURL(file.type, file.size, checksum, companyName);
      if (signedURL.error) {
        alert(signedURL.error);
        return;
      }
      const url = signedURL.success?.url;
      const key = signedURL.success?.key;
      const userId = signedURL.success?.userId;
      if (!url) {
        alert("Failed to get signed URL.");
        return;
      }
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });
      if (!res.ok) {
        throw new Error("Failed to upload company logo");
      }
      return { key, userId };  // Return the key and userId for further processing if needed
    }

  const handleNext = async () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      // Handle form submission logic here
      //validate inputs
      if (!companyLogo || !companyName || !jobDescription || !jobMetadata.jobTitle || !jobMetadata.jobType || !jobMetadata.jobLocationType || !jobMetadata.jobLocation || !jobMetadata.workingType || !jobMetadata.experience.min || !jobMetadata.experience.max || !jobMetadata.salary.min || !jobMetadata.salary.max) {
        alert("Please fill all required fields.");
        return;
      }

      //upload company logo to s3
      let key: string | undefined;
      let userId: string | undefined;
      try {
        const uploadResult = await handleUploadLogo(companyLogo);
        if (!uploadResult || !uploadResult.key || !uploadResult.userId) {
          alert("Failed to upload company logo. Please try again.");
          return;
        }
        key = uploadResult.key;
        userId = uploadResult.userId;
      }
      catch (error) {
        console.log("Error uploading company logo:", error);
        alert("Failed to upload company logo. Please try again.");
        return;
      }
      const url = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_BUCKET_REGION}.amazonaws.com/${key}`;

      // sending to supabase
      try{
      const { data, error } = await supabase
        .from("jobs")
        .insert([
          {
            company_logo_url: url,
            company_name: companyName,
            job_title: jobMetadata.jobTitle,
            job_type: jobMetadata.jobType,
            job_location_type: jobMetadata.jobLocationType,
            job_location: jobMetadata.jobLocation,
            working_type: jobMetadata.workingType,
            min_experience_needed: Number(jobMetadata.experience.min),
            max_experience_needed: Number(jobMetadata.experience.max),
            min_salary: Number(jobMetadata.salary.min), 
            max_salary: Number(jobMetadata.salary.max),
            job_description: jobDescription,
            admin_id: userId, 
          },
        ]);
      if (error) {
        console.log("Error inserting job:", error);
        alert("Failed to create job. Please try again.");
        return;
      }
      }
      catch(error) {
        console.log("Error inserting job:", error);
        alert("Failed to create job. Please try again.");
        return;
      }
      // Redirect or show success message
      alert("Company logo uploaded successfully!");
      router.push("/jobs");
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else router.push("/jobs");
  };

  return (
    <div
      className={`transition-all duration-300 min-h-full md:pb-0 px-0 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      } md:pt-0 pt-4`}
    >
      <div className="max-w-7xl w-full mx-auto mt-4 px-2 md:px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center text-neutral-500 hover:text-neutral-700 font-semibold text-lg"
          >
            <HiOutlineArrowCircleLeft className="w-8 h-8 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-lg text-neutral-300">/</span>
          <Link
            href="/jobs"
            className="text-neutral-500 hover:text-neutral-700 font-semibold text-lg"
          >
            Jobs
          </Link>
          <span className="text-lg text-neutral-300">/</span>
          <span className="text-lg font-semibold text-neutral-900">
            Add a New Job
          </span>
        </div>
        <h1 className="text-2xl font-semibold mb-1">Add a New Job</h1>
        <p className="text-neutral-500 text-sm mb-6">
          Create and publish a new job listing to attract the right candidates.
        </p>
        <div className="flex gap-4 mb-6">
          <div className="flex gap-4 border-b border-neutral-300 w-fit">
            {steps.map((s, i) => (
              <button
                key={s}
                className={`px-4 py-2 text-center font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  i === step
                    ? "border-b-4 border-blue-600 text-blue-600"
                    : "text-neutral-500"
                }`}
                onClick={() => setStep(i)}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center w-full">
          <div className="max-w-5xl w-full pb-20">
            <form
              className="bg-white rounded-2xl shadow-xs p-6"
              onSubmit={(e) => e.preventDefault()}
            >
              {step === 0 && (
                <div>
                  <label className="block text-lg font-medium mb-2">
                    Company Logo
                  </label>
                  <label
                    className="flex flex-col items-center justify-center rounded-lg p-6 my-8 bg-neutral-100 cursor-pointer transition hover:bg-neutral-200/80 max-w-sm mx-auto"
                    htmlFor="company-logo-upload"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        document.getElementById("company-logo-upload")?.click();
                      }
                    }}
                  >
                    {companyLogo ? (
                      <Image
                        src={URL.createObjectURL(companyLogo)}
                        alt="Company Logo Preview"
                        width={80}
                        height={80}
                        className="rounded-xl object-cover mb-2"
                      />
                    ) : (
                      <>
                        <FiUpload className="text-blue-600 text-3xl" />
                        <span className="font-medium text-neutral-700">
                          Upload Media
                        </span>
                        <span className="text-xs text-neutral-400 mt-1">
                          Accepted file types: jpg, jpeg, png | Ratio must be
                          1:1
                        </span>
                      </>
                    )}
                    <input
                      id="company-logo-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={handleLogoChange}
                      tabIndex={-1}
                    />
                  </label>
                  <label className="block font-semibold mb-2">
                    Name of the hiring company (client)
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 mb-4"
                    placeholder="e.g. Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              )}
              {step === 1 && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block font-medium mb-2">
                        Job Title<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 mb-4"
                        placeholder="e.g. UI/UX Designer"
                        value={jobMetadata.jobTitle}
                        onChange={(e) =>
                          setJobMetadata({
                            ...jobMetadata,
                            jobTitle: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-2">
                        Job Type<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 mb-4"
                        value={jobMetadata.jobType}
                        onChange={(e) =>
                          setJobMetadata({
                            ...jobMetadata,
                            jobType: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select</option>
                        <option>Full-Time</option>
                        <option>Part-Time</option>
                        <option>Internship</option>
                        <option>Contract</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-2">
                        Job Location Type<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 mb-4"
                        value={jobMetadata.jobLocationType}
                        onChange={(e) =>
                          setJobMetadata({
                            ...jobMetadata,
                            jobLocationType: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select</option>
                        <option>On-site</option>
                        <option>Remote</option>
                        <option>Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-2">
                        Job Location<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 mb-4"
                        value={jobMetadata.jobLocation}
                        onChange={(e) =>
                          setJobMetadata({
                            ...jobMetadata,
                            jobLocation: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select</option>
                        <option>Remote</option>
                        <option>New York</option>
                        <option>San Francisco</option>
                        <option>Bangalore</option>
                        <option>London</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-2">
                        Working Type<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2 mb-4"
                        value={jobMetadata.workingType}
                        onChange={(e) =>
                          setJobMetadata({
                            ...jobMetadata,
                            workingType: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select</option>
                        <option>Day</option>
                        <option>Night</option>
                        <option>Flexible</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block font-medium mb-2">
                      Experience<span className="text-red-500">*</span>{" "}
                      <span className="text-neutral-400">(e.g. 1-2 Years)</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2"

                        value={jobMetadata.experience.min}
                        onChange={(e) =>
                          setJobMetadata({
                            ...jobMetadata,
                            experience: {
                              ...jobMetadata.experience,
                              min: e.target.value,
                            },
                          })
                        }
                        required
                      >
                        <option value="">Min.</option>
                        {[...Array(11).keys()].map((y) => (
                          <option key={y} value={y}>
                            {y === 10 ? "10+" : y}
                          </option>
                        ))}
                      </select>
                      <select
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                        value={jobMetadata.experience.max}
                        onChange={(e) =>
                          setJobMetadata({
                            ...jobMetadata,
                            experience: {
                              ...jobMetadata.experience,
                              max: e.target.value,
                            },
                          })
                        }
                        required
                      >
                        <option value="">Max</option>
                        {[...Array(11).keys()].map((y) => (
                          <option key={y} value={y}>
                            {y === 10 ? "10+" : y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block font-medium mb-2">
                      Salary<span className="text-red-500">*</span>{" "}
                      <span className="text-neutral-400">
                        (e.g. 4 -4.8 Lakhs)
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                        value={jobMetadata.salary.min}
                        onChange={(e) =>
                          setJobMetadata({
                            ...jobMetadata,
                            salary: {
                              ...jobMetadata.salary,
                              min: e.target.value,
                            },
                          })
                        }
                        required
                      >
                        <option value="">Min.</option>
                        {[...Array(51).keys()].map((s) => (
                          <option key={s + 1} value={s + 1}>
                            {s + 1}
                          </option>
                        ))}
                      </select>
                      <select
                        className="w-full border border-neutral-300 rounded-lg px-3 py-2"
                        value={jobMetadata.salary.max}
                        onChange={(e) =>
                          setJobMetadata({
                            ...jobMetadata,
                            salary: {
                              ...jobMetadata.salary,
                              max: e.target.value,
                            },
                          })
                        }
                        required
                      >
                        <option value="">Max</option>
                        {[...Array(51).keys()].map((s) => (
                          <option key={s + 1} value={s + 1}>
                            {s + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <label className="block font-medium mb-2">
                    Job Description<span className="text-red-500">*</span>
                  </label>
                  <LexicalEditor
                    value={jobDescription}
                    onChange={(setValue) => setJobDescription(setValue)}
                  />
                </div>
              )}
            </form>
            <div className="flex justify-end mt-6 gap-2">
              <button
                type="button"
                className="border border-neutral-400 text-neutral-700 rounded-lg px-6 py-2 font-medium hover:bg-neutral-100 cursor-pointer"
                onClick={handleBack}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-blue-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-blue-700 flex items-center cursor-pointer"
                onClick={handleNext}
              >
                {step === steps.length - 1 ? "Submit" : "Next"}
                <span className="ml-2">
                  <FaArrowRight />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
