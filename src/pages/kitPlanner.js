/**
 * SafeSphere Emergency Kit Planner
 * Dynamic household-tailored 72-hour supply generator with progress tracking,
 * localStorage persistence, and print support.
 */

import { storage } from "../utils/storage.js";
import { showToast } from "../components/toast.js";

const DEFAULT_PROFILE = {
  familySize: 3,
  children: 1,
  olderAdults: 0,
  hasPets: false,
  hasMedicalNeeds: false
};

export function renderKitPlanner(mainElement) {
  const profile = storage.get("kit_profile", DEFAULT_PROFILE);
  let checkedItems = storage.get("kit_checked_items", {});

  mainElement.className = "page page-kit-planner";
  mainElement.innerHTML = `
    <div class="content-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-pre">72-Hour Survival Tool</div>
        <h1 class="page-title">Emergency Kit Planner</h1>
        <p class="page-lead">
          Configure your household profile to generate an accurate, scaled 72-hour emergency survival checklist.
          Check off items as you pack them to monitor your household autonomy.
        </p>
      </header>

      <!-- Profile Configurator Card -->
      <section class="planner-config-card" aria-labelledby="config-title">
        <div class="config-header">
          <div class="config-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div>
            <h2 id="config-title" class="config-title">Household Parameters</h2>
            <p class="config-sub">Supply quotas automatically scale based on the number and special requirements of occupants.</p>
          </div>
        </div>

        <form id="profile-form" class="config-form">
          <div class="config-grid">
            <!-- Total Family Size -->
            <div class="form-group">
              <label for="input-family-size" class="form-label">Total Household Members</label>
              <div class="counter-input">
                <button type="button" class="btn-step" data-target="input-family-size" data-delta="-1" aria-label="Decrease family members">-</button>
                <input type="number" id="input-family-size" name="familySize" min="1" max="12" value="${profile.familySize}" class="number-field" />
                <button type="button" class="btn-step" data-target="input-family-size" data-delta="1" aria-label="Increase family members">+</button>
              </div>
              <span class="field-hint">Adults and children combined</span>
            </div>

            <!-- Children -->
            <div class="form-group">
              <label for="input-children" class="form-label">Children / Infants (under 12)</label>
              <div class="counter-input">
                <button type="button" class="btn-step" data-target="input-children" data-delta="-1" aria-label="Decrease children">-</button>
                <input type="number" id="input-children" name="children" min="0" max="6" value="${profile.children}" class="number-field" />
                <button type="button" class="btn-step" data-target="input-children" data-delta="1" aria-label="Increase children">+</button>
              </div>
              <span class="field-hint">Adds pediatric and infant care items</span>
            </div>

            <!-- Older Adults -->
            <div class="form-group">
              <label for="input-older-adults" class="form-label">Older Adults (65+)</label>
              <div class="counter-input">
                <button type="button" class="btn-step" data-target="input-older-adults" data-delta="-1" aria-label="Decrease older adults">-</button>
                <input type="number" id="input-older-adults" name="olderAdults" min="0" max="6" value="${profile.olderAdults}" class="number-field" />
                <button type="button" class="btn-step" data-target="input-older-adults" data-delta="1" aria-label="Increase older adults">+</button>
              </div>
              <span class="field-hint">Adds mobility and sensory items</span>
            </div>
          </div>

          <!-- Toggles: Pets & Medical Needs -->
          <div class="config-toggles-row">
            <label class="toggle-pill ${profile.hasPets ? 'checked' : ''}">
              <input type="checkbox" id="input-pets" name="hasPets" ${profile.hasPets ? 'checked' : ''} />
              <span class="toggle-checkbox-custom"></span>
              <span class="toggle-label">We have Household Pets (Cat/Dog)</span>
            </label>

            <label class="toggle-pill ${profile.hasMedicalNeeds ? 'checked' : ''}">
              <input type="checkbox" id="input-medical" name="hasMedicalNeeds" ${profile.hasMedicalNeeds ? 'checked' : ''} />
              <span class="toggle-checkbox-custom"></span>
              <span class="toggle-label">Chronic Medical or Prescription Needs</span>
            </label>
          </div>
        </form>
      </section>

      <!-- Checklist Toolbar & Progress Tracker -->
      <div class="checklist-status-bar">
        <div class="status-left">
          <div class="status-metric">
            <span id="packed-count-label" class="metric-val">0 / 0</span>
            <span class="metric-title">Items Packed</span>
          </div>
          <div class="checklist-progress-track">
            <div id="checklist-progress-bar" class="checklist-progress-fill" style="width: 0%;"></div>
          </div>
        </div>

        <div class="status-actions">
          <button id="btn-save-kit" class="btn btn-secondary btn-sm" title="Save current progress">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span>Save Progress</span>
          </button>
          <button id="btn-print-kit" class="btn btn-outline btn-sm" title="Print physical checklist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Print List</span>
          </button>
          <button id="btn-reset-kit" class="btn btn-ghost btn-sm" title="Reset all checkboxes">
            <span>Reset</span>
          </button>
        </div>
      </div>

      <!-- Generated Checklist Sections -->
      <div id="checklist-container" class="checklist-container">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  const form = mainElement.querySelector("#profile-form");
  const checklistContainer = mainElement.querySelector("#checklist-container");
  const packedLabel = mainElement.querySelector("#packed-count-label");
  const progressBar = mainElement.querySelector("#checklist-progress-bar");
  const saveBtn = mainElement.querySelector("#btn-save-kit");
  const printBtn = mainElement.querySelector("#btn-print-kit");
  const resetBtn = mainElement.querySelector("#btn-reset-kit");

  function getSupplyItems(currentProf) {
    const size = Math.max(1, parseInt(currentProf.familySize, 10) || 1);
    const kids = Math.max(0, parseInt(currentProf.children, 10) || 0);
    const elders = Math.max(0, parseInt(currentProf.olderAdults, 10) || 0);

    const waterLiters = size * 3 * 3.8; // 3.8L (1 gal) per person per day for 3 days
    const foodMeals = size * 3 * 3; // 3 meals per person for 3 days

    const categories = [
      {
        id: "cat-water-food",
        name: "Hydration & Sustenance (72 Hours)",
        badge: "Essential",
        items: [
          {
            id: "item-water",
            name: "Drinking Water Reserves",
            detail: `${waterLiters.toFixed(0)} Liters (~${(waterLiters / 3.8).toFixed(0)} Gallons) sealed in clean food-grade containers. Minimum 1 gallon/person/day.`,
            essential: true
          },
          {
            id: "item-food",
            name: "Ready-to-Eat Non-Perishable Food",
            detail: `${foodMeals} shelf-stable ration meals (canned beans, protein bars, dry oats, peanut butter). No cooking required.`,
            essential: true
          },
          {
            id: "item-can-opener",
            name: "Manual Can Opener & Utensils",
            detail: "Heavy-duty hand-crank can opener and reusable spoons/forks.",
            essential: false
          },
          {
            id: "item-water-tabs",
            name: "Water Purification Tablets or Filter",
            detail: "Chlorine dioxide tablets or portable gravity filter for treating unverified backup water.",
            essential: false
          }
        ]
      },
      {
        id: "cat-health-trauma",
        name: "First Aid & Medical Kit",
        badge: "Life-Safety",
        items: [
          {
            id: "item-first-aid-box",
            name: "Complete Trauma & First Aid Kit",
            detail: "Sterile gauze pads, roll bandages, adhesive bandages in assorted sizes, medical adhesive tape, trauma shears.",
            essential: true
          },
          {
            id: "item-antiseptic",
            name: "Antiseptic Liquid & Burn Dressing",
            detail: "Povidone-iodine solution, antiseptic wipes, burn gel sheets for immediate cooling.",
            essential: true
          },
          {
            id: "item-basic-meds",
            name: "Core Over-the-Counter Medications",
            detail: "Pain relievers (paracetamol/ibuprofen), oral rehydration salts (ORS packets), antihistamines, antacids.",
            essential: true
          },
          {
            id: "item-thermometer",
            name: "Digital Thermometer & Nitrile Gloves",
            detail: "Battery-powered digital thermometer and 4+ pairs of medical-grade disposable gloves.",
            essential: false
          }
        ]
      },
      {
        id: "cat-power-tools",
        name: "Power, Tools & Communication",
        badge: "Utility",
        items: [
          {
            id: "item-flashlight",
            name: "High-Lumen LED Flashlights",
            detail: `${Math.max(1, size)} reliable flashlights or headlamps with 2 full sets of spare alkaline batteries.`,
            essential: true
          },
          {
            id: "item-power-bank",
            name: "High-Capacity Power Bank",
            detail: "20,000 mAh+ external battery pack, kept fully charged with matching phone cables.",
            essential: true
          },
          {
            id: "item-radio",
            name: "Emergency Battery / Hand-Crank Radio",
            detail: "AM/FM weather-band radio to receive official disaster broadcasts if cellular networks fail.",
            essential: true
          },
          {
            id: "item-whistle",
            name: "Emergency Signaling Whistle",
            detail: "Loud pea-less plastic whistles (${size} count) to signal rescue teams if trapped.",
            essential: true
          },
          {
            id: "item-multitool",
            name: "Multi-Tool & Gas Shutoff Wrench",
            detail: "Pliers, wire cutters, knife blade, and non-sparking crescent wrench for utility shutoff.",
            essential: false
          }
        ]
      },
      {
        id: "cat-sanitation-docs",
        name: "Documents & Personal Sanitation",
        badge: "Records",
        items: [
          {
            id: "item-waterproof-docs",
            name: "Waterproof Vital Documents Pouch",
            detail: "Certified physical copies of government IDs, property deeds, insurance policies, and prescription lists.",
            essential: true
          },
          {
            id: "item-contacts-card",
            name: "Laminated Emergency Contacts Card",
            detail: "Written list of out-of-town relatives, local hospitals, and physician numbers.",
            essential: true
          },
          {
            id: "item-masks",
            name: "N95 Particulate Respirator Masks",
            detail: `${size * 2} masks to protect against toxic wildfire smoke, building debris, and dust.`,
            essential: true
          },
          {
            id: "item-hygiene",
            name: "Sanitation & Heavy Garbage Bags",
            detail: "Moist towelettes, hand sanitizer, heavy-duty trash bags, and ties for emergency sanitation.",
            essential: false
          },
          {
            id: "item-cash",
            name: "Small Denomination Emergency Cash",
            detail: "Physical paper currency in low denominations (ATMs and card terminals fail during power blackouts).",
            essential: true
          }
        ]
      }
    ];

    // Children specific supplies
    if (kids > 0) {
      categories.push({
        id: "cat-children",
        name: `Infant & Pediatric Care (${kids} Children)`,
        badge: "Specialized",
        items: [
          {
            id: "item-pediatric-food",
            name: "Baby Formula & Shelf-Stable Baby Food",
            detail: "72-hour supply of pre-mixed infant formula, dry baby cereal, or jarred baby foods.",
            essential: true
          },
          {
            id: "item-diapers",
            name: "Diapers, Wipes & Diaper Rash Cream",
            detail: "Full 3-day reserve of disposable diapers and hypoallergenic wet wipes.",
            essential: true
          },
          {
            id: "item-pediatric-meds",
            name: "Infant Paracetamol & Electrolyte Drops",
            detail: "Liquid pediatric fever suspension with measured oral syringe.",
            essential: true
          },
          {
            id: "item-comfort-toy",
            name: "Comfort Item or Familiar Blanket",
            detail: "Small favorite toy or puzzle to reduce acute psychological trauma and stress.",
            essential: false
          }
        ]
      });
    }

    // Older adult specific supplies
    if (elders > 0) {
      categories.push({
        id: "cat-elders",
        name: `Older Adult Support (${elders} Elders)`,
        badge: "Specialized",
        items: [
          {
            id: "item-elder-mobility",
            name: "Mobility Support & Spare Glasses",
            detail: "Spare pair of reading/distance glasses and backup cane or walker tip.",
            essential: true
          },
          {
            id: "item-hearing-aid",
            name: "Hearing Aid Spare Batteries",
            detail: "Fresh button cell batteries for assistive auditory devices.",
            essential: true
          },
          {
            id: "item-denture-care",
            name: "Denture Care & Soft Foods",
            detail: "Denture adhesive and easily chewable nutrition packs.",
            essential: false
          }
        ]
      });
    }

    // Medical dependency specific supplies
    if (currentProf.hasMedicalNeeds) {
      categories.push({
        id: "cat-medical-needs",
        name: "Chronic Medical Supplies & Rx",
        badge: "Critical",
        items: [
          {
            id: "item-7day-rx",
            name: "7-Day Surplus Prescription Medications",
            detail: "Life-sustaining medicines (blood pressure, heart medication, thyroid, inhalers).",
            essential: true
          },
          {
            id: "item-cold-storage",
            name: "Insulated Cooler Pack / Thermal Pouch",
            detail: "Small insulated bag with reusable gel ice packs for temperature-sensitive drugs like insulin.",
            essential: true
          },
          {
            id: "item-glucometer",
            name: "Blood Pressure Cuff / Glucose Test Kit",
            detail: "Testing meter, fresh lancets, and test strips with spare device batteries.",
            essential: false
          }
        ]
      });
    }

    // Pets specific supplies
    if (currentProf.hasPets) {
      categories.push({
        id: "cat-pets",
        name: "Household Pet Preparedness",
        badge: "Companion",
        items: [
          {
            id: "item-pet-food",
            name: "3-Day Pet Food & Water Rations",
            detail: "Canned or dry pet food stored in airtight container plus collapsible water bowl.",
            essential: true
          },
          {
            id: "item-pet-leash",
            name: "Sturdy Leash, Harness & Muzzle",
            detail: "Frightened animals bolt during disasters; secure harness and leash are vital.",
            essential: true
          },
          {
            id: "item-pet-carrier",
            name: "Ventilated Pet Carrier / Crate",
            detail: "Properly sized carrier for rapid evacuation and transport.",
            essential: false
          },
          {
            id: "item-pet-records",
            name: "Vaccination Records & Microchip Info",
            detail: "Rabies certificate and recent photograph in case pet becomes lost.",
            essential: true
          }
        ]
      });
    }

    return categories;
  }

  function updateChecklist() {
    const categories = getSupplyItems(profile);
    let totalItems = 0;
    let checkedCount = 0;

    categories.forEach(cat => {
      cat.items.forEach(item => {
        totalItems++;
        if (checkedItems[item.id]) {
          checkedCount++;
        }
      });
    });

    const pct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
    packedLabel.textContent = `${checkedCount} / ${totalItems}`;
    progressBar.style.width = `${pct}%`;

    checklistContainer.innerHTML = categories.map(cat => `
      <section class="checklist-section" aria-labelledby="cat-title-${cat.id}">
        <div class="checklist-section-header">
          <div class="cat-title-wrap">
            <h3 id="cat-title-${cat.id}" class="cat-title">${cat.name}</h3>
            <span class="cat-badge">${cat.badge}</span>
          </div>
          <span class="cat-count">
            ${cat.items.filter(i => checkedItems[i.id]).length} / ${cat.items.length} packed
          </span>
        </div>

        <div class="checklist-items-grid">
          ${cat.items.map(item => {
            const isChecked = !!checkedItems[item.id];
            return `
              <label class="kit-item-card ${isChecked ? 'is-packed' : ''}">
                <input
                  type="checkbox"
                  class="kit-item-checkbox"
                  data-item-id="${item.id}"
                  ${isChecked ? 'checked' : ''}
                />
                <div class="kit-item-content">
                  <div class="kit-item-title-row">
                    <span class="kit-item-name">${item.name}</span>
                    ${item.essential ? '<span class="essential-tag">Essential</span>' : ''}
                  </div>
                  <p class="kit-item-detail">${item.detail}</p>
                </div>
              </label>
            `;
          }).join("")}
        </div>
      </section>
    `).join("");

    // Attach checkbox listeners
    checklistContainer.querySelectorAll(".kit-item-checkbox").forEach(box => {
      box.addEventListener("change", (e) => {
        const itemId = e.target.getAttribute("data-item-id");
        checkedItems[itemId] = e.target.checked;
        storage.set("kit_checked_items", checkedItems);
        updateChecklist();
      });
    });
  }

  // Profile Form Listeners
  form.querySelectorAll(".btn-step").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const delta = parseInt(btn.getAttribute("data-delta"), 10);
      const input = form.querySelector(`#${targetId}`);
      if (input) {
        let val = parseInt(input.value, 10) || 0;
        val += delta;
        const min = parseInt(input.min, 10) || 0;
        const max = parseInt(input.max, 10) || 20;
        if (val >= min && val <= max) {
          input.value = val;
          profile[input.name] = val;
          storage.set("kit_profile", profile);
          updateChecklist();
        }
      }
    });
  });

  form.querySelectorAll(".number-field").forEach(input => {
    input.addEventListener("change", () => {
      let val = parseInt(input.value, 10) || 0;
      const min = parseInt(input.min, 10) || 0;
      const max = parseInt(input.max, 10) || 20;
      val = Math.max(min, Math.min(max, val));
      input.value = val;
      profile[input.name] = val;
      storage.set("kit_profile", profile);
      updateChecklist();
    });
  });

  form.querySelectorAll("input[type='checkbox']").forEach(chk => {
    chk.addEventListener("change", () => {
      profile[chk.name] = chk.checked;
      const pill = chk.closest(".toggle-pill");
      if (pill) {
        if (chk.checked) pill.classList.add("checked");
        else pill.classList.remove("checked");
      }
      storage.set("kit_profile", profile);
      updateChecklist();
    });
  });

  // Action Buttons
  saveBtn.addEventListener("click", () => {
    storage.set("kit_profile", profile);
    storage.set("kit_checked_items", checkedItems);
    showToast("Emergency kit checklist saved successfully to your browser.", "success");
  });

  printBtn.addEventListener("click", () => {
    window.print();
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("Reset all checkboxes? This clears your currently packed marks.")) {
      checkedItems = {};
      storage.set("kit_checked_items", checkedItems);
      updateChecklist();
      showToast("Checklist has been reset.", "info");
    }
  });

  // Initial render
  updateChecklist();
}
