"use strict";
const kind = document.body.dataset.form;
const cancellation = kind === "cancellation";
const form = document.getElementById("letterForm");
const fields = [
  ["recipient", "To / เรียน"],
  ["clubName", "Organization name / ชื่อองค์กร"],
  ["activityName", "Activity name / ชื่อกิจกรรม"],
  ["originalSchedule", "Original schedule / กำหนดการเดิม"],
  ["budget", "Approved budget (Baht) / งบประมาณเดิม", "number"],
  ["reason", "Reason / เหตุผล", "textarea"],
  ...(cancellation ? [
    ["sourceActivity", "Transfer from activity / โอนจากกิจกรรม"],
    ["sourceAmount", "Amount transferred from (Baht) / จำนวนเงินต้นทาง", "number"],
    ["targetActivity", "Transfer to activity / โอนไปยังกิจกรรม"],
    ["targetAmount", "Amount transferred to (Baht) / จำนวนเงินปลายทาง", "number"],
    ["budgetReason", "Reason for reallocation / เหตุผลการปรับงบประมาณ", "textarea"]
  ] : [
    ["newSchedule", "New schedule / กำหนดการใหม่"],
    ["time", "Time / เวลา"],
    ["venue", "Venue / สถานที่"],
    ["location", "Location / ที่ตั้ง"],
    ["newBudget", "Revised budget (Baht) / งบประมาณใหม่", "number"],
    ["budgetReason", "Reason for budget change / เหตุผลการปรับงบประมาณ", "textarea"]
  ]),
  ["president", "President / ประธาน"],
  ["presidentDate", "President signature date (optional) / วันที่ลงนาม", "date"],
  ["advisor", "Advisor / อาจารย์ที่ปรึกษา"],
  ["advisorDate", "Advisor signature date (optional) / วันที่ลงนาม", "date"]
];
form.innerHTML = '<label>Document language / ภาษา<select name="language"><option value="en">English</option><option value="th">ไทย</option></select></label><label>Organization type / ประเภทองค์กร<select name="organizationType"><option value="club">Club / ชมรม</option><option value="association">Student Association / สโมสรนักศึกษา</option></select></label>';
if (!cancellation) {
  const label = document.createElement("label");
  label.textContent = "Budget / งบประมาณ";
  const select = document.createElement("select");
  select.name = "budgetMode";
  select.innerHTML = '<option value="unchanged">Unchanged / ไม่เปลี่ยนแปลง</option><option value="changed">Changed / เปลี่ยนแปลง</option>';
  label.append(select); form.append(label);
}
for (const [name, labelText, type = "text"] of fields) {
  const label = document.createElement("label"); label.textContent = labelText;
  const input = document.createElement(type === "textarea" ? "textarea" : "input");
  input.name = name;
  if (type !== "textarea") input.type = type;
  if (type === "number") { input.min = "0"; input.step = "0.01"; }
  label.append(input); form.append(label);
}
const reset = document.createElement("button");
reset.type = "reset"; reset.className = "danger"; reset.textContent = "Clear form";
form.append(reset);
const note = document.createElement("p"); note.className = "screen-note";
note.textContent = "Use Save data to keep a copy of your entries for later."; form.append(note);

function collectData() { return {formType: kind, version: 1, ...Object.fromEntries(new FormData(form))}; }
function render() {
  const d = collectData();
  const association = d.organizationType === "association";
  for (const key of ["clubName", "advisor"]) {
    form.elements[key].closest("label").hidden = association;
  }
  if (!cancellation) for (const key of ["newBudget", "budgetReason"]) {
    form.elements[key].closest("label").hidden = d.budgetMode !== "changed";
  }
  const text = key => String(d[key] || "").trim() || "________________";
  const money = key => d[key] === "" ? "________________" : Number(d[key]).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const date = key => d[key] ? d[key].split("-").reverse().join("/") : "……/……/………";
  const preview = document.getElementById("preview"); preview.replaceChildren();
  for (const lang of [d.language === "th" ? "th" : "en"]) {
    const th = lang === "th";
    const organization = th ? (association ? "สโมสรนักศึกษา" : "ชมรม") : (association ? "Student Association" : "Club");
    const organizationName = association ? organization : (th ? organization + " " + text("clubName") : text("clubName") + " " + organization);
    const page = document.createElement("article"); page.className = "paper letter"; page.lang = lang;
    page.innerHTML = '<header class="document-header"><img class="document-logo" src="assets/logo.png" alt="MU ICT Student Association logo"></header>';
    const paragraph = (content, cls = "prose") => {
      const p = document.createElement("p"); p.className = cls; p.textContent = content; page.append(p);
    };
    paragraph((th ? "เรียน " : "To: ") + text("recipient"), "");
    paragraph((th ? "เรื่อง " : "Subject: ") + (cancellation
      ? (th ? "ชี้แจงการไม่ได้ดำเนินการจัดกิจกรรมและการปรับเปลี่ยนงบประมาณกิจกรรม " : "Explanation for Not Conducting the Activity and Budget Reallocation for ")
      : (th ? "ขออนุญาตเลื่อนจัดกิจกรรม " : "Request for Postponement of Activity ")) + "“" + text("activityName") + "”", "");
    paragraph(th
      ? "เนื่องด้วย" + organizationName + " ได้รับอนุมัติงบประมาณในการจัดกิจกรรม “" + text("activityName") + "” โดยมีกำหนดการเดิมในช่วง " + text("originalSchedule") + " เป็นจำนวนเงิน " + money("budget") + " บาท"
      : "The " + organizationName + " " + (cancellation ? "was" : "has been") + " granted a budget to organize the activity “" + text("activityName") + ",” which was originally scheduled during " + text("originalSchedule") + " with a total budget of " + money("budget") + " Baht.");
    paragraph(th
      ? "แต่เนื่องจาก " + text("reason") + (cancellation ? " จึงทำให้ไม่สามารถดำเนินการจัดกิจกรรมดังกล่าวได้ตามแผนที่กำหนดไว้" : " จึงทำให้ไม่สามารถดำเนินการจัดกิจกรรมตามระยะเวลาที่กำหนดได้")
      : "However, due to " + text("reason") + (cancellation ? ", it was not possible to proceed with the activity as planned." : ", it is not possible to proceed with the activity within the originally scheduled timeframe."));
    if (cancellation) {
      paragraph(th
        ? "ดังนั้น " + organizationName + " จึงขอชี้แจงว่าไม่ได้ดำเนินการจัดกิจกรรม “" + text("activityName") + "” ตามกำหนดการเดิม"
        : "Therefore, the " + organizationName + " would like to inform and clarify that the activity “" + text("activityName") + "” was not conducted as originally scheduled.");
      if (!th) paragraph("The allocated budget of " + money("budget") + " Baht has not been utilized.");
      paragraph(th
        ? "ทั้งนี้ งบประมาณดังกล่าวจึงได้มีการปรับจากกิจกรรม “" + text("sourceActivity") + "” จำนวน " + money("sourceAmount") + " บาท ไปยังกิจกรรม “" + text("targetActivity") + "” จำนวน " + money("targetAmount") + " บาท เนื่องจาก " + text("budgetReason")
        : "The budget has therefore been reallocated from the activity “" + text("sourceActivity") + "” in the amount of " + money("sourceAmount") + " Baht to the activity “" + text("targetActivity") + "” in the amount of " + money("targetAmount") + " Baht due to " + text("budgetReason") + ".");
    } else {
      paragraph(th
        ? "จากเหตุผลดังกล่าว " + organizationName + " จึงขอเลื่อนการจัดกิจกรรม “" + text("activityName") + "” จากกำหนดการเดิม " + text("originalSchedule") + " เป็น " + text("newSchedule") + " เวลา " + text("time") + " ณ " + text("venue") + " " + text("location")
        : "Therefore, the " + organizationName + " would like to request approval to postpone the activity “" + text("activityName") + "” from the original schedule " + text("originalSchedule") + " to " + text("newSchedule") + " at " + text("time") + ", " + text("venue") + ", located at " + text("location") + ".");
      paragraph(d.budgetMode === "changed"
        ? (th ? "ทั้งนี้ งบประมาณได้มีการเปลี่ยนแปลงจากเดิมจำนวน " + money("budget") + " บาท เป็นจำนวน " + money("newBudget") + " บาท เนื่องจาก " + text("budgetReason") : "The budget has been adjusted from " + money("budget") + " Baht to " + money("newBudget") + " Baht due to " + text("budgetReason") + ".")
        : (th ? "ทั้งนี้ งบประมาณจำนวน " + money("budget") + " บาท ยังคงใช้ตามวัตถุประสงค์เดิมของกิจกรรม" : "The approved budget of " + money("budget") + " Baht will remain unchanged and be used in accordance with the original objectives of the activity."));
    }
    const signatures = document.createElement("section"); signatures.className = "signature-block signatures";
    for (const [name, role] of [["president", th ? "ประธาน" + organization : organization + " President"], ["advisor", association ? "Chairperson of the Student Activities Supervisory Board" : (th ? "อาจารย์ที่ปรึกษา" + organization : organization + " Advisor")]]) {
      const sig = document.createElement("div"); sig.className = "signature";
      const line = document.createElement("div"); line.className = "signature-line"; sig.append(line);
      const signatureName = association && name === "advisor" ? "Asst. Prof. Dr. Thanapon Noraset" : text(name);
      for (const value of ["(" + signatureName + ")", role, date(name + "Date")]) {
        const p = document.createElement("p"); p.textContent = value; sig.append(p);
      }
      signatures.append(sig);
    }
    page.append(signatures); preview.append(page);
  }
}
function loadData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data) || data.formType !== kind) throw new Error("Please open a saved " + kind + " form.");
  if (data.language && !["en","th","both"].includes(data.language)) throw new Error("Invalid document language.");
  if (data.organizationType && !["club","association"].includes(data.organizationType)) throw new Error("Invalid organization type.");
  if (!cancellation && data.budgetMode && !["unchanged", "changed"].includes(data.budgetMode)) throw new Error("Invalid budget option.");
  form.reset();
  for (const input of form.elements) if (input.name && typeof data[input.name] === "string") input.value = data[input.name];
  // Older saved forms may contain both languages; open them as English only.
  form.elements.language.value = data.language === "th" ? "th" : "en";
  render();
}
form.addEventListener("input", render);
form.addEventListener("change", render);
form.addEventListener("reset", () => setTimeout(render, 0));
document.getElementById("sampleButton").addEventListener("click", () => loadData({
  formType: kind, language: "en", organizationType: "club", recipient: "Student Activities Supervisory Board",
  clubName: "Digital Media", activityName: "Student Workshop", originalSchedule: "20 September 2026",
  budget: "5000", reason: "venue unavailability",
  sourceActivity: "Student Workshop", sourceAmount: "5000", targetActivity: "Student Showcase",
  targetAmount: "5000", budgetReason: "updated activity requirements",
  newSchedule: "4 October 2026", time: "13:00–16:00", venue: "ICT Building", location: "Salaya",
  budgetMode: "unchanged", newBudget: "6000", president: "Anan Jaidee", advisor: "Dr. Example Advisor"
}));
document.getElementById("downloadButton").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(collectData(), null, 2)], {type:"application/json"}));
  const a = document.createElement("a"); a.href = url; a.download = kind + "-form.json"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.getElementById("uploadInput").addEventListener("change", async event => {
  const file = event.target.files[0]; if (!file) return;
  try { loadData(JSON.parse(await file.text())); } catch (error) { alert(error.message || "Invalid saved form."); }
  event.target.value = "";
});
document.getElementById("printButton").addEventListener("click", async () => { await document.fonts.ready; window.print(); });
render();
