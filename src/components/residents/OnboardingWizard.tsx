"use client";

import { useActionState, useState, useTransition } from "react";
import { onboardResidentAction } from "@/app/actions/residents";
import { SmartBedPicker } from "@/components/residents/SmartBedPicker";
import {
  User, Shield, BedDouble, Check, AlertCircle,
  ChevronRight, ChevronLeft, Loader2, Eye, EyeOff
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Account & Contact", icon: User },
  { id: 2, label: "KYC & Emergency", icon: Shield },
  { id: 3, label: "Bed & Contract", icon: BedDouble },
];

interface OnboardingWizardProps {
  availableBuildings: any[];
}

export function OnboardingWizard({ availableBuildings }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Step 1 state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("resident123");
  const [gender, setGender] = useState("MALE");

  // Step 2 state
  const [dob, setDob] = useState("");
  const [idProofType, setIdProofType] = useState("STUDENT_ID");
  const [idProofNumber, setIdProofNumber] = useState("");
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");

  // Step 3 state
  const [selectedBedId, setSelectedBedId] = useState("");
  const [selectedBedLabel, setSelectedBedLabel] = useState("");
  const [selectedRoomInfo, setSelectedRoomInfo] = useState<any>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");

  const [serverError, setServerError] = useState<string | null>(null);

  // Validation per step
  const step1Valid = fullName.trim() && email.trim() && password.length >= 6;
  const step2Valid = idProofNumber.trim() && emergencyName.trim() && emergencyPhone.trim() && emergencyRelation.trim();
  const step3Valid = !!selectedBedId && !!startDate;

  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1);
  };

  const handleSubmit = () => {
    if (!step3Valid) return;
    setServerError(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.append("fullName", fullName);
      fd.append("email", email);
      fd.append("phoneNumber", phoneNumber);
      fd.append("password", password);
      fd.append("gender", gender);
      fd.append("dob", dob);
      fd.append("idProofType", idProofType);
      fd.append("idProofNumber", idProofNumber);
      if (idProofFile) fd.append("idProofDocument", idProofFile);
      fd.append("emergencyName", emergencyName);
      fd.append("emergencyPhone", emergencyPhone);
      fd.append("emergencyRelation", emergencyRelation);
      fd.append("bedId", selectedBedId);
      fd.append("startDate", startDate);
      if (endDate) fd.append("endDate", endDate);

      const result = await onboardResidentAction(null, fd);
      if (result?.error) setServerError(result.error);
      // If successful, the server action redirects to /dashboard/residents
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Progress Bar */}
      <nav aria-label="Onboarding steps" className="mb-8">
        <ol className="flex items-center">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <li key={s.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-[13px] border transition-all ${
                      isCompleted
                        ? "bg-slate-900 border-slate-900 text-white"
                        : isCurrent
                        ? "bg-white border-blue-600 text-blue-600 ring-4 ring-blue-500/12"
                        : "bg-white border-slate-300 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-medium uppercase tracking-[0.16em] hidden sm:block ${
                      isCurrent ? "text-blue-600" : isCompleted ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? "bg-slate-900" : "bg-slate-200"}`} />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Server Error */}
      {serverError && (
        <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-[12px] text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-card">
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.015em] text-slate-900">Account &amp; Contact Info</h2>
              <p className="text-[12px] text-slate-500 mt-1">Create the resident student&apos;s login account credentials.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="resident@example.com"
                  className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 placeholder:text-slate-400 font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 text-[13px] font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[12px] text-slate-400 mt-1 font-mono">Default: resident123</p>
              </div>

              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 cursor-pointer"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other / Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.015em] text-slate-900">KYC &amp; Emergency Contact</h2>
              <p className="text-[12px] text-slate-500 mt-1">Identity verification and emergency contact details.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  ID Proof Type
                </label>
                <select
                  value={idProofType}
                  onChange={(e) => setIdProofType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 cursor-pointer"
                >
                  <option value="STUDENT_ID">Student ID Card</option>
                  <option value="NATIONAL_ID">National ID / Aadhaar</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  ID Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={idProofNumber}
                  onChange={(e) => setIdProofNumber(e.target.value)}
                  placeholder="e.g. STU-2024-00123"
                  className="w-full px-3.5 py-2.5 text-[13px] font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  ID Document Upload
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                  className="w-full px-3.5 py-2 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-700 file:mr-2.5 file:text-xs file:font-medium file:border-0 file:bg-slate-100 file:text-slate-700 file:rounded-lg file:px-2.5 file:py-1 hover:file:bg-slate-200 cursor-pointer"
                />
                <p className="text-[12px] text-slate-400 mt-1">Accepted: JPG, PNG, PDF</p>
              </div>
            </div>

            <hr className="border-slate-100" />

            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-slate-900">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Contact Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Maria Rivera"
                  className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 555 000 0001"
                  className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 placeholder:text-slate-400 font-mono tabular-nums"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Relationship <span className="text-rose-500">*</span>
                </label>
                <select
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 cursor-pointer"
                >
                  <option value="">Select relationship…</option>
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-[15px] font-semibold tracking-[-0.015em] text-slate-900">Bed Assignment &amp; Lease Terms</h2>
            <p className="text-[12px] text-slate-500">
              Showing only VACANT beds in buildings matching the resident&apos;s gender ({gender}).
              Monthly rent will be locked at the selected room type&apos;s base rate.
            </p>

            <SmartBedPicker
              buildings={availableBuildings}
              selectedBedId={selectedBedId}
              onSelect={(bedId, bedLabel, roomInfo) => {
                setSelectedBedId(bedId);
                setSelectedBedLabel(bedLabel);
                setSelectedRoomInfo(roomInfo);
              }}
            />

            {selectedRoomInfo && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-[12px] text-blue-900">
                <p className="font-mono font-medium mb-1">Selected: {selectedRoomInfo.buildingName} — Room {selectedRoomInfo.roomNumber} — Bed {selectedBedLabel}</p>
                <p>Monthly Rent: <span className="font-mono tabular-nums font-medium">${selectedRoomInfo.baseRent.toFixed(2)}</span></p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Check-In Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                  Lease End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-3.5 py-2.5 text-[13px] rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/12 hover:border-slate-400 transition-colors bg-white text-slate-900 font-mono tabular-nums"
                />
                <p className="text-[12px] text-slate-400 mt-1">Leave blank for open-ended lease</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={`flex items-center mt-6 pt-5 border-t border-slate-200/80 ${step > 1 ? "justify-between" : "justify-end"}`}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-40 focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
            >
              Continue <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !step3Valid}
              className="inline-flex items-center gap-2 px-6 py-2 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-40 focus:outline-hidden focus:ring-4 focus:ring-slate-900/20"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isPending ? "Creating Resident..." : "Create Resident & Allocate Bed"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Sidebar (Step 3 only) */}
      {step === 3 && (
        <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-card text-[12px] space-y-1 text-slate-600">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 mb-2">Review Summary</p>
          <p><span className="text-slate-400">Name:</span> {fullName}</p>
          <p><span className="text-slate-400">Email:</span> {email}</p>
          <p><span className="text-slate-400">Gender:</span> {gender}</p>
          <p><span className="text-slate-400">ID Type:</span> {idProofType} — {idProofNumber}</p>
          <p><span className="text-slate-400">Emergency:</span> {emergencyName} ({emergencyRelation})</p>
          {selectedRoomInfo && <p><span className="text-slate-400">Bed:</span> {selectedRoomInfo.buildingName} — Room {selectedRoomInfo.roomNumber} — {selectedBedLabel}</p>}
        </div>
      )}
    </div>
  );
}

