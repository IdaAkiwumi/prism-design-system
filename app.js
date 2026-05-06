const form = document.getElementById("specForm");
const jsonOutput = document.getElementById("jsonOutput");
const copyJsonBtn = document.getElementById("copyJsonBtn");
const downloadJsonBtn = document.getElementById("downloadJsonBtn");

function buildSpec() {
  const componentType = document.getElementById("componentType").value;
  const variant = document.getElementById("variant").value;
  const state = document.getElementById("state").value;
  const theme = document.getElementById("theme").value;
  const label = document.getElementById("label").value.trim() || "Button";
  const notes = document.getElementById("notes").value.trim();

  return {
    componentType,
    variant,
    state,
    theme,
    label,
    notes
  };
}

function renderSpec() {
  const spec = buildSpec();
  jsonOutput.textContent = JSON.stringify(spec, null, 2);
  return spec;
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  renderSpec();
});

copyJsonBtn.addEventListener("click", async function () {
  const specText = jsonOutput.textContent || JSON.stringify(buildSpec(), null, 2);

  try {
    await navigator.clipboard.writeText(specText);
    alert("JSON copied to clipboard.");
  } catch (error) {
    alert("Could not copy JSON. You may need to copy it manually.");
  }
});

downloadJsonBtn.addEventListener("click", function () {
  const spec = jsonOutput.textContent || JSON.stringify(buildSpec(), null, 2);
  const blob = new Blob([spec], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "prism-component-spec.json";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
});

renderSpec();