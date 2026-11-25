/* Public, unauthenticated viewer. Data is an explicit projection of the public GitHub Project. */
(function () {
  "use strict";
  var palette = {
    "CTDG Website": "#F38020", "Interactive Demos": "#F38020",
    "KayaCart": "#7F52FF", "Gandalf Mobile": "#16834B",
    "Axiom Architect": "#4285F4", "DeepMind Resources": "#168B68",
    "TrailTrade": "#B49B00", "Command Centre": "#3178C6",
    "Managed AI": "#635BFF", "AI Research": "#DB61A2",
    "Engineering Portfolio": "#0891B2"
  };
  var get = function (id) { return document.getElementById(id); };
  function node(tag, className, value) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (value !== undefined) n.textContent = String(value);
    return n;
  }
  function formatDate(date) {
    if (!date) return "Not yet verified";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Not yet verified";
    return new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric", timeZone: "UTC"
    });
  }
  function safeUrl(value) {
    if (typeof value !== "string") return false;
    try {
      var u = new URL(value);
      if (u.protocol !== "https:") return false;
      if (u.hostname === "github.com") {
        return u.pathname.indexOf("/colintandyonline") === 0 ||
          u.pathname.indexOf("/users/colintandyonline/projects/11") === 0;
      }
      return [
        "ctdigital.group", "www.axiom-architect.co", "axiom-studio.co",
        "v0-ai-learning-platform-nine-henna.vercel.app",
        "trailtrade-live.vercel.app", "colintandyonline.github.io"
      ].indexOf(u.hostname) >= 0;
    } catch (_) { return false; }
  }
  function link(url, label) {
    var a = node("a", "", label);
    a.href = safeUrl(url) ? url : "https://github.com/colintandyonline";
    a.rel = "noopener noreferrer";
    return a;
  }
  function stageClass(stage) {
    return stage === "Completed" ? "complete" : stage === "In progress" ? "progress" : "planned";
  }
  function render(data) {
    if (!data || data.schemaVersion !== 1 || !data.source ||
        data.source.projectNumber !== 11 || !Array.isArray(data.items)) {
      throw new Error("Unexpected roadmap data");
    }
    var items = data.items;
    if (!items.length || items.some(function (m) {
      return !m || typeof m.title !== "string" ||
        !Object.prototype.hasOwnProperty.call(palette, m.project) ||
        ["Completed", "In progress", "Planned"].indexOf(m.stage) < 0 ||
        ["Live", "Active development", "Research", "Engineering"].indexOf(m.lifecycle) < 0 ||
        !safeUrl(m.publicUrl);
    })) throw new Error("Invalid public roadmap records");
    if (safeUrl(data.source.url)) get("boardLink").href = data.source.url;
    var counts = { Completed: 0, "In progress": 0, Planned: 0 };
    items.forEach(function (m) { counts[m.stage]++; });
    var total = items.length, complete = counts.Completed;
    var projectNames = Array.from(new Set(items.map(function (m) { return m.project; })));
    var projects = projectNames.filter(function (p) { return p !== "Engineering Portfolio"; }).map(function (name) {
      var records = items.filter(function (m) { return m.project === name; });
      var dates = records.map(function (m) { return m.earliestRecordedDevelopment; }).filter(Boolean).sort();
      return { name: name, items: records, earliest: dates.length ? dates[0] : null };
    });
    [
      ["Milestones", total, "Public milestone records"],
      ["Completed", complete, Math.round(complete * 100 / total) + "% of " + total + " milestones"],
      ["In progress", counts["In progress"], "Active public milestones"],
      ["Projects", projects.length, "Tracked product programmes"]
    ].forEach(function (entry) {
      var block = node("div", "panel");
      block.appendChild(node("span", "metric-label", entry[0]));
      block.appendChild(node("strong", "metric-value", entry[1]));
      block.appendChild(node("span", "metric-foot", entry[2]));
      get("stats").appendChild(block);
    });
    [
      ["Completed", "#39b3a0"], ["In progress", "#50bce9"], ["Planned", "#ac8bd1"]
    ].forEach(function (entry) {
      var row = node("div", "chart-row");
      var track = node("div", "track");
      var fill = node("div", "fill");
      fill.style.background = entry[1];
      fill.style.width = (counts[entry[0]] * 100 / total) + "%";
      track.appendChild(fill);
      row.appendChild(node("span", "", entry[0]));
      row.appendChild(track);
      row.appendChild(node("strong", "", counts[entry[0]]));
      get("stageBars").appendChild(row);
    });
    projects.forEach(function (p) {
      var card = node("article", "project-card");
      card.style.setProperty("--project", palette[p.name]);
      var heading = node("div", "project-top");
      heading.appendChild(node("h3", "", p.name));
      heading.appendChild(node("span", "symbol"));
      card.appendChild(heading);
      card.appendChild(node("small", "", p.items[0].lifecycle));
      card.appendChild(node("p", "", p.items.length + " public milestone(s) | Earliest evidence: " + formatDate(p.earliest)));
      card.appendChild(link(p.items[0].publicUrl, "Explore public project"));
      get("projects").appendChild(card);
    });
    projects.sort(function (a, b) {
      return (a.earliest || "9999").localeCompare(b.earliest || "9999");
    }).forEach(function (p) {
      var entry = node("div", "timeline-entry");
      entry.style.setProperty("--project", palette[p.name]);
      var box = node("div", "timeline-body");
      box.appendChild(node("strong", "", p.name));
      box.appendChild(node("p", "", p.items[0].evidenceLabel || "Verified project-specific source record"));
      entry.appendChild(node("span", "timeline-date", formatDate(p.earliest)));
      entry.appendChild(node("div", "timeline-line"));
      entry.appendChild(box);
      get("timeline").appendChild(entry);
    });
    projectNames.sort().forEach(function (name) {
      var o = node("option", "", name);
      o.value = name;
      get("projectFilter").appendChild(o);
    });
    function update() {
      var project = get("projectFilter").value;
      var stage = get("stageFilter").value;
      var search = get("search").value.trim().toLowerCase();
      var visible = items.filter(function (m) {
        return (!project || m.project === project) &&
          (!stage || m.stage === stage) &&
          (!search || [m.title, m.project, m.evidenceLabel || ""].join(" ").toLowerCase().indexOf(search) >= 0);
      });
      var out = get("milestones");
      out.replaceChildren();
      get("resultCount").textContent = visible.length + " of " + total + " milestones";
      if (!visible.length) out.appendChild(node("p", "empty", "No approved milestones match these filters."));
      visible.forEach(function (m) {
        var card = node("article", "milestone");
        card.style.setProperty("--project", palette[m.project]);
        var top = node("div", "milestone-top");
        top.appendChild(node("span", "eyebrow", m.project));
        top.appendChild(node("span", "chip " + stageClass(m.stage), m.stage));
        card.appendChild(top);
        card.appendChild(node("h3", "", m.title));
        card.appendChild(node("p", "detail", m.evidenceLabel || "Approved public milestone"));
        var dates = [];
        if (m.milestoneStart) dates.push("Recorded start: " + formatDate(m.milestoneStart));
        if (m.completedDate) dates.push("Verified completion: " + formatDate(m.completedDate));
        if (m.targetDate) dates.push("Approved target: " + formatDate(m.targetDate));
        if (dates.length) card.appendChild(node("p", "meta", dates.join(" | ")));
        card.appendChild(node("span", "chip", m.lifecycle));
        card.appendChild(node("p", "", ""));
        card.appendChild(link(m.publicUrl, "Public project link"));
        out.appendChild(card);
      });
    }
    var controls = [get("projectFilter"), get("stageFilter"), get("search")];
    controls.forEach(function (control) {
      control.addEventListener(control.tagName === "INPUT" ? "input" : "change", update);
    });
    update();
    var date = data.source.generatedAt ?
      new Date(data.source.generatedAt).toLocaleString("en-GB", {
        dateStyle: "medium", timeStyle: "short", timeZone: "UTC"
      }) + " UTC" : "Time not verified";
    get("refresh").textContent = "Reviewed data snapshot: " + date;
    get("loaded").hidden = false;
  }
  fetch("./roadmap.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("Unavailable"); return r.json(); })
    .then(render)
    .catch(function () { get("loadError").hidden = false; });
})();
