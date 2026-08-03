import React, { useState, useEffect, useMemo, useCallback } from "react";

/* ------------------------------------------------------------------ */
/* Données de référence                                                */
/* ------------------------------------------------------------------ */

const ALTITUDE = 850;

// Repères de densité et d'espacement PEBI (p. 96-97 du livre).
// type "unit" = 1 case = 1 plant. type "row" = semis dense en ligne,
// mieux géré en quantité (graines/plants) par case qu'en case unique.
const CATALOGUE = [
  { id: "ail", nom: "Ail", emoji: "🧄", famille: "alliacees", bonsVoisins: ["radis"], type: "unit", distPlantsCm: "10 cm", distRangsCm: "25-30 cm", densiteM2: 13.5, repere: "Privilégier la plantation d'automne.", plantationExt: [9, 10], recolteJours: 210, arrosageJours: 5, serreOk: false, uniteDefaut: "pièces" },
  { id: "aubergine", nom: "Aubergine", emoji: "🍆", famille: "solanacees", bonsVoisins: ["basilic"], soins: [{ jours: 10, label: "Installer un tuteur", emoji: "🪵" }, { jours: 14, label: "Pailler au pied", emoji: "🌾" }], type: "unit", distPlantsCm: "40-50 cm", distRangsCm: "60 cm", densiteM2: 3.5, repere: "Aime les sols chauds.", semisSerre: [2, 3], plantationExt: [5], recolteJours: 110, arrosageJours: 1, serreOk: true, uniteDefaut: "pièces" },
  { id: "betterave", nom: "Betterave", emoji: "🔴", famille: "chenopodiacees", bonsVoisins: ["radis"], type: "unit", distPlantsCm: "8-10 cm", distRangsCm: "25-30 cm", densiteM2: 13.5, repere: "Plantation en quinconce possible.", semisExt: [4, 5, 6], recolteJours: 80, arrosageJours: 3, serreOk: false, uniteDefaut: "pièces" },
  { id: "carotte", nom: "Carotte", emoji: "🥕", famille: "apiacees", bonsVoisins: ["oignon", "poireau"], type: "row", distPlantsCm: "2-3 cm", distRangsCm: "20-25 cm", densiteM2: 350, repere: "Semis en ligne, éclaircissage indispensable.", semisExt: [4, 5, 6], recolteJours: 90, arrosageJours: 2, serreOk: false, uniteDefaut: "kg" },
  { id: "chou", nom: "Chou", emoji: "🥬", famille: "brassicacees", bonsVoisins: ["thym"], type: "unit", distPlantsCm: "50-60 cm", distRangsCm: "60-70 cm", densiteM2: 2.5, repere: "Tasser le pied à la plantation.", soins: [{ jours: 10, label: "Pailler au pied", emoji: "🌾" }], semisSerre: [2, 3], plantationExt: [4, 5], recolteJours: 100, arrosageJours: 2, serreOk: true, uniteDefaut: "pièces" },
  { id: "chourave", nom: "Chou-rave", emoji: "🥦", famille: "brassicacees", type: "unit", distPlantsCm: "25-30 cm", distRangsCm: "25-30 cm", densiteM2: 11, repere: "Rotation rapide, à intercaler avec des salades.", semisSerre: [3], plantationExt: [5], recolteJours: 60, arrosageJours: 2, serreOk: true, uniteDefaut: "pièces" },
  { id: "concombre", nom: "Concombre", emoji: "🥒", famille: "cucurbitacees", bonsVoisins: ["tournesol"], soins: [{ jours: 7, label: "Installer un treillis", emoji: "🪵" }, { jours: 10, label: "Pailler au pied", emoji: "🌾" }], type: "unit", distPlantsCm: "40 cm", distRangsCm: "80 cm", densiteM2: 2.5, repere: "Palissage conseillé pour gagner de la place.", semisSerre: [3, 4], plantationExt: [5, 6], recolteJours: 65, arrosageJours: 1, serreOk: true, uniteDefaut: "pièces" },
  { id: "courgette", nom: "Courgette", emoji: "🥒", famille: "cucurbitacees", soins: [{ jours: 10, label: "Pailler au pied", emoji: "🌾" }], type: "unit", distPlantsCm: "1 m", distRangsCm: "1 m", densiteM2: 1, repere: "Prévoir beaucoup d'espace.", semisSerre: [3, 4], plantationExt: [5, 6], recolteJours: 60, arrosageJours: 2, serreOk: true, uniteDefaut: "pièces" },
  { id: "courge", nom: "Courge", emoji: "🎃", famille: "cucurbitacees", bonsVoisins: ["mais", "haricotgrimpant"], soins: [{ jours: 10, label: "Pailler au pied", emoji: "🌾" }], type: "unit", distPlantsCm: "1-1.5 m", distRangsCm: "1.5-2 m", densiteM2: 0.5, repere: "Estimation (hors tableau du livre) : cultures traçantes, prévoir beaucoup d'espace au sol.", semisSerre: [3, 4], plantationExt: [5], recolteJours: 120, arrosageJours: 3, serreOk: true, uniteDefaut: "pièces" },
  { id: "tournesol", nom: "Tournesol", emoji: "🌻", famille: "asteracees", bonsVoisins: ["concombre"], type: "unit", distPlantsCm: "30-40 cm", distRangsCm: "60 cm", densiteM2: 5, repere: "Estimation (hors tableau du livre) : bon compagnon pour attirer les pollinisateurs.", semisExt: [4, 5], recolteJours: 90, arrosageJours: 3, serreOk: false, uniteDefaut: "pièces" },
  { id: "epinard", nom: "Épinard", emoji: "🍃", famille: "chenopodiacees", type: "row", distPlantsCm: "5-8 cm", distRangsCm: "25-30 cm", densiteM2: 45, repere: "Semis en blocs plutôt qu'en case unique.", semisExt: [3, 4, 8, 9], recolteJours: 45, arrosageJours: 2, serreOk: true, uniteDefaut: "kg" },
  { id: "haricotgrimpant", nom: "Haricot grimpant", emoji: "🫘", famille: "fabacees", bonsVoisins: ["mais", "courge"], soins: [{ jours: 5, label: "Installer rames ou filet", emoji: "🪵" }], type: "unit", distPlantsCm: "20-25 cm", distRangsCm: "70-80 cm", densiteM2: 3.5, repere: "Rames ou filets nécessaires.", semisExt: [5, 6], recolteJours: 75, arrosageJours: 2, serreOk: false, uniteDefaut: "kg" },
  { id: "haricotnain", nom: "Haricot nain", emoji: "🫛", famille: "fabacees", type: "row", distPlantsCm: "8-10 cm", distRangsCm: "30-40 cm", densiteM2: 35, repere: "Semis direct en double rang serré.", semisExt: [5, 6], recolteJours: 70, arrosageJours: 2, serreOk: false, uniteDefaut: "kg" },
  { id: "mais", nom: "Maïs doux", emoji: "🌽", famille: "poacees", bonsVoisins: ["haricotgrimpant", "courge"], type: "unit", distPlantsCm: "25-30 cm", distRangsCm: "60-70 cm", densiteM2: 4.5, repere: "Planter en blocs multiples pour la pollinisation.", semisExt: [5], recolteJours: 80, arrosageJours: 2, serreOk: false, uniteDefaut: "pièces" },
  { id: "navet", nom: "Navet", emoji: "🥔", famille: "brassicacees", type: "row", distPlantsCm: "8-10 cm", distRangsCm: "25 cm", densiteM2: 17.5, repere: "Rotation courte, bon pour les successions.", semisExt: [3, 4, 8], recolteJours: 50, arrosageJours: 2, serreOk: false, uniteDefaut: "pièces" },
  { id: "oignon", nom: "Oignon", emoji: "🧅", famille: "alliacees", bonsVoisins: ["carotte"], type: "row", distPlantsCm: "8-10 cm", distRangsCm: "25 cm", densiteM2: 22.5, repere: "Plantation en quinconce possible.", semisSerre: [2, 3], plantationExt: [4], recolteJours: 150, arrosageJours: 3, serreOk: true, uniteDefaut: "pièces" },
  { id: "poireau", nom: "Poireau", emoji: "🧅", famille: "alliacees", bonsVoisins: ["carotte"], soins: [{ jours: 45, label: "Butter légèrement", emoji: "⛰️" }], type: "unit", distPlantsCm: "15 cm", distRangsCm: "30-40 cm", densiteM2: 17.5, repere: "Plantation profonde, prévoir un buttage.", semisSerre: [2, 3], plantationExt: [5, 6], recolteJours: 150, arrosageJours: 3, serreOk: true, uniteDefaut: "pièces" },
  { id: "pois", nom: "Petit pois", emoji: "🟢", famille: "fabacees", bonsVoisins: ["radis"], mauvaisVoisins: ["ail", "oignon", "poireau"], soins: [{ jours: 5, label: "Installer un filet ou des branches", emoji: "🪵" }], type: "row", distPlantsCm: "4-5 cm", distRangsCm: "40 cm", densiteM2: 22.5, repere: "Prévoir un filet ou des branches pour soutenir.", semisExt: [2, 3, 8], recolteJours: 65, arrosageJours: 2, serreOk: false, uniteDefaut: "kg" },
  { id: "poivron", nom: "Poivron", emoji: "🫑", famille: "solanacees", soins: [{ jours: 10, label: "Installer un tuteur si besoin", emoji: "🪵" }, { jours: 14, label: "Pailler au pied", emoji: "🌾" }], type: "unit", distPlantsCm: "40-50 cm", distRangsCm: "50-60 cm", densiteM2: 3.5, repere: "Paillage obligatoire pour chaleur et humidité.", semisSerre: [2, 3], plantationExt: [5], recolteJours: 110, arrosageJours: 1, serreOk: true, uniteDefaut: "pièces" },
  { id: "pdt", nom: "Pomme de terre", emoji: "🥔", famille: "solanacees", soins: [{ jours: 20, label: "1er buttage", emoji: "⛰️" }, { jours: 40, label: "2e buttage", emoji: "⛰️" }], type: "unit", distPlantsCm: "30-35 cm", distRangsCm: "60-70 cm", densiteM2: 4.5, repere: "Quinconce idéal, buttage nécessaire.", plantationExt: [4, 5], recolteJours: 110, arrosageJours: 4, serreOk: false, uniteDefaut: "kg" },
  { id: "salade", nom: "Salade", emoji: "🥬", famille: "asteracees", bonsVoisins: ["radis"], type: "unit", distPlantsCm: "25-30 cm", distRangsCm: "25-30 cm", densiteM2: 11, repere: "Quinconce idéal pour optimiser la place.", semisSerre: [2, 3], semisExt: [4, 5, 6, 7], recolteJours: 55, arrosageJours: 1, serreOk: true, uniteDefaut: "pièces" },
  { id: "tomate", nom: "Tomate", emoji: "🍅", famille: "solanacees", bonsVoisins: ["basilic"], soins: [{ jours: 10, label: "Installer un tuteur", emoji: "🪵" }, { jours: 14, label: "Pailler au pied", emoji: "🌾" }], type: "unit", distPlantsCm: "40-60 cm", distRangsCm: "70-80 cm", densiteM2: 2.5, repere: "Enterrer la tige profondément, prévoir un tuteur.", semisSerre: [2, 3], plantationExt: [5], recolteJours: 100, arrosageJours: 1, serreOk: true, uniteDefaut: "pièces" },
  { id: "radis", nom: "Radis", emoji: "🔴", famille: "brassicacees", bonsVoisins: ["salade", "pois", "betterave", "ail"], type: "row", distPlantsCm: "2-3 cm", distRangsCm: "15 cm", densiteM2: 150, repere: "Estimation (hors tableau du livre) : resemer toutes les 2 semaines.", semisSerre: [2, 3], semisExt: [4, 5, 6, 7, 8], recolteJours: 28, arrosageJours: 1, serreOk: true, uniteDefaut: "pièces" },
  { id: "piment", nom: "Piment", emoji: "🌶️", famille: "solanacees", soins: [{ jours: 10, label: "Installer un tuteur si besoin", emoji: "🪵" }, { jours: 14, label: "Pailler au pied", emoji: "🌾" }], type: "unit", distPlantsCm: "30-40 cm", distRangsCm: "50 cm", densiteM2: 5, repere: "Estimation (hors tableau du livre) : proche du poivron, aime la chaleur.", semisSerre: [2, 3], plantationExt: [5], recolteJours: 100, arrosageJours: 1, serreOk: true, uniteDefaut: "pièces" },
  { id: "basilic", nom: "Basilic", emoji: "🌿", famille: "lamiacees", bonsVoisins: ["tomate"], type: "unit", distPlantsCm: "20-25 cm", distRangsCm: "25 cm", densiteM2: 16, repere: "Estimation (hors tableau du livre) : craint le froid, à sortir tard.", semisSerre: [3, 4], plantationExt: [5, 6], recolteJours: 60, arrosageJours: 1, serreOk: true, uniteDefaut: "poignées" },
  { id: "persil", nom: "Persil", emoji: "🌱", famille: "apiacees", type: "unit", distPlantsCm: "15-20 cm", distRangsCm: "25 cm", densiteM2: 25, repere: "Estimation (hors tableau du livre) : germination lente, tenir humide.", semisSerre: [3], semisExt: [4, 8], recolteJours: 70, arrosageJours: 2, serreOk: true, uniteDefaut: "poignées" },
  { id: "ciboulette", nom: "Ciboulette", emoji: "🌿", famille: "alliacees", type: "unit", distPlantsCm: "20 cm", distRangsCm: "25 cm", densiteM2: 20, repere: "Estimation (hors tableau du livre) : vivace, repart chaque année.", semisSerre: [2, 3], plantationExt: [4, 5], recolteJours: 60, arrosageJours: 2, serreOk: true, uniteDefaut: "poignées" },
  { id: "thym", nom: "Thym", emoji: "🌿", famille: "lamiacees", bonsVoisins: ["chou"], type: "unit", distPlantsCm: "30 cm", distRangsCm: "30 cm", densiteM2: 11, repere: "Estimation (hors tableau du livre) : vivace, résiste bien à la sécheresse.", plantationExt: [4, 5], recolteJours: 90, arrosageJours: 6, serreOk: false, uniteDefaut: "poignées" },
];

// Familles botaniques (p. 88-89) : à ne pas replanter au même endroit
// avant le nombre d'années indiqué, pour couper le cycle des parasites/maladies.
// Légumes sensibles au gel — utilisé pour les alertes météo.
const FROST_SENSITIVE = new Set([
  "tomate", "poivron", "piment", "aubergine", "basilic",
  "courgette", "courge", "concombre", "mais", "haricotgrimpant", "haricotnain", "tournesol",
]);

const FAMILLES = {
  solanacees: { nom: "Solanacées", rotationAns: 4 },
  brassicacees: { nom: "Brassicacées", rotationAns: 3 },
  alliacees: { nom: "Alliacées", rotationAns: 3 },
  fabacees: { nom: "Fabacées (légumineuses)", rotationAns: 2 },
  apiacees: { nom: "Apiacées", rotationAns: 3 },
  cucurbitacees: { nom: "Cucurbitacées", rotationAns: 3 },
  chenopodiacees: { nom: "Chénopodiacées", rotationAns: 3 },
  asteracees: { nom: "Astéracées", rotationAns: 2 },
  lamiacees: { nom: "Lamiacées", rotationAns: 2 },
  poacees: { nom: "Poacées", rotationAns: 2 },
  autres: { nom: "Autres", rotationAns: 2 },
};

const MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const MOIS_LONG = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const JOURS_LONG = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const JOURS_COURT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const UNITES = ["pièces", "kg", "g", "poignées"];

/* ------------------------------------------------------------------ */
/* Zones du jardin                                                     */
/* ------------------------------------------------------------------ */

const ZONES = [
  { id: "serre", nom: "Serre", surface: "2.5 m² plantable (4 m² au sol)", surfaceM2: 2.5, cols: 8, rows: 5, greenhouse: true, icon: "🏡" },
  { id: "droite", nom: "Devant, à droite", surface: "2.5 m²", surfaceM2: 2.5, cols: 8, rows: 5, greenhouse: false, icon: "🌱" },
  { id: "face", nom: "Devant, en face", surface: "10 m²", surfaceM2: 10, cols: 20, rows: 8, greenhouse: false, icon: "🌻" },
  { id: "arriere", nom: "Arrière (bande extensive)", surface: "2 m²", surfaceM2: 2, cols: 8, rows: 4, greenhouse: false, icon: "🥔" },
];

function cellKey(zoneId, r, c) {
  return `${zoneId}:${r}:${c}`;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISO(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function todayISO() {
  return toISO(new Date());
}

function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISO(d);
}

function daysBetween(isoA, isoB) {
  const a = new Date(isoA + "T00:00:00");
  const b = new Date(isoB + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Vérifie si la famille botanique du légume a déjà occupé cette case
// récemment (moins que le nombre d'années de rotation recommandé).
function getRotationWarning(key, vegetableId, rotationHistory) {
  const veg = CATALOGUE.find((v) => v.id === vegetableId);
  if (!veg) return null;
  const famille = FAMILLES[veg.famille];
  const history = rotationHistory[key] || [];
  let mostRecent = null;
  history.forEach((h) => {
    const hVeg = CATALOGUE.find((v) => v.id === h.vegetableId);
    if (hVeg && hVeg.famille === veg.famille) {
      if (!mostRecent || h.date > mostRecent.date) mostRecent = h;
    }
  });
  if (!mostRecent) return null;
  const yearsSince = daysBetween(mostRecent.date, todayISO()) / 365;
  if (yearsSince < famille.rotationAns) {
    const lastVeg = CATALOGUE.find((v) => v.id === mostRecent.vegetableId);
    return {
      familleNom: famille.nom,
      rotationAns: famille.rotationAns,
      yearsSince: Math.round(yearsSince * 10) / 10,
      lastVegNom: lastVeg?.nom,
    };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const [tab, setTab] = useState("jardin");
  const [activeZone, setActiveZone] = useState("serre");
  const [plantings, setPlantings] = useState({});
  const [rotationHistory, setRotationHistory] = useState({});
  const [emptySince, setEmptySince] = useState({});
  const [doneTasks, setDoneTasks] = useState({});
  const [harvests, setHarvests] = useState([]);
  const [weather, setWeather] = useState(null); // { data, updatedAt, loading, error }
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState("idle");

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("garden-data");
        const res = raw ? { value: raw } : null;
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setPlantings(parsed.plantings || {});
          setHarvests(parsed.harvests || []);
          setRotationHistory(parsed.rotationHistory || {});
          setEmptySince(parsed.emptySince || {});
          setDoneTasks(parsed.doneTasks || {});
        }
      } catch (e) {
        // premier lancement, rien à charger
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      setSaveState("saving");
      try {
        localStorage.setItem("garden-data", JSON.stringify({ plantings, harvests, rotationHistory, emptySince, doneTasks }));
        setSaveState("saved");
      } catch (e) {
        setSaveState("error");
      }
    })();
  }, [plantings, harvests, rotationHistory, emptySince, doneTasks, loaded]);

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("weather-cache");
        const res = raw ? { value: raw } : null;
        if (res && res.value) setWeather(JSON.parse(res.value));
      } catch (e) {
        // pas de météo en cache pour l'instant
      }
    })();
  }, []);

  // Venthône, Valais (Chemin de Tsamplan), ~850 m d'altitude
  const LAT = 46.307;
  const LON = 7.529;

  const exportData = useCallback(() => {
    const raw = localStorage.getItem("garden-data");
    if (!raw) return;
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `potager-venthone-sauvegarde-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        localStorage.setItem("garden-data", JSON.stringify(parsed));
        window.location.reload();
      } catch (err) {
        alert("Ce fichier ne semble pas être une sauvegarde valide de l'appli potager.");
      }
    };
    reader.readAsText(file);
  }, []);

  const fetchWeather = useCallback(async () => {
    setWeather((prev) => ({ ...(prev || {}), loading: true, error: null }));
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
        `&current=temperature_2m,precipitation,weather_code` +
        `&daily=precipitation_sum,precipitation_probability_max,temperature_2m_min,temperature_2m_max,weather_code` +
        `&forecast_days=2&timezone=Europe%2FZurich`;
      const response = await fetch(url);
      const raw = await response.json();

      const dailyCode0 = raw.daily.weather_code[0];
      const dailyCode1 = raw.daily.weather_code[1];
      const orageCodes = [95, 96, 99];

      const pluieAujourdhui = (raw.daily.precipitation_sum[0] >= 1) || (raw.daily.precipitation_probability_max[0] >= 60);
      const pluieDemain = (raw.daily.precipitation_sum[1] >= 1) || (raw.daily.precipitation_probability_max[1] >= 60);
      const risqueGel = raw.daily.temperature_2m_min[0] <= 1 || raw.daily.temperature_2m_min[1] <= 1;
      const risqueCanicule = raw.daily.temperature_2m_max[0] >= 30 || raw.daily.temperature_2m_max[1] >= 30;
      const risqueOrage = orageCodes.includes(dailyCode0) || orageCodes.includes(dailyCode1);

      const parts = [];
      parts.push(`${Math.round(raw.daily.temperature_2m_min[0])}° à ${Math.round(raw.daily.temperature_2m_max[0])}°C aujourd'hui`);
      if (pluieAujourdhui) parts.push("pluie prévue aujourd'hui");
      else if (pluieDemain) parts.push("pluie prévue demain");
      if (risqueGel) parts.push("risque de gel");
      if (risqueCanicule) parts.push("canicule possible");
      if (risqueOrage) parts.push("orage possible");
      const resume = parts.join(", ") + ".";

      const parsed = {
        resume,
        temperatureActuelle: Math.round(raw.current.temperature_2m),
        pluieAujourdhui,
        pluieDemain,
        risqueGel,
        risqueCanicule,
        risqueOrage,
      };

      const result = { data: parsed, updatedAt: new Date().toISOString(), loading: false, error: null };
      setWeather(result);
      try {
        localStorage.setItem("weather-cache", JSON.stringify(result));
      } catch (e) {
        // tant pis, on garde au moins la valeur en mémoire pour cette session
      }
    } catch (e) {
      setWeather((prev) => ({ ...(prev || {}), loading: false, error: "Impossible de récupérer la météo pour l'instant." }));
    }
  }, []);

  const setCellPlanting = useCallback((zoneId, r, c, data) => {
    const key = cellKey(zoneId, r, c);
    const old = plantings[key];
    if (old) {
      setRotationHistory((h) => {
        const list = h[key] ? [...h[key]] : [];
        list.push({ vegetableId: old.vegetableId, date: old.date });
        return { ...h, [key]: list };
      });
    }
    setEmptySince((prev) => {
      const next = { ...prev };
      if (data === null) next[key] = todayISO();
      else delete next[key];
      return next;
    });
    setPlantings((prev) => {
      const next = { ...prev };
      if (data === null) delete next[key];
      else next[key] = data;
      return next;
    });
  }, [plantings]);

  const upsertHarvest = useCallback((entry) => {
    setHarvests((prev) => {
      const exists = prev.some((h) => h.id === entry.id);
      if (exists) return prev.map((h) => (h.id === entry.id ? entry : h));
      return [...prev, entry];
    });
  }, []);

  const deleteHarvest = useCallback((id) => {
    setHarvests((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const tasks = useMemo(() => {
    const list = [];
    const today = todayISO();
    Object.entries(plantings).forEach(([key, p]) => {
      const veg = CATALOGUE.find((v) => v.id === p.vegetableId);
      if (!veg) return;
      const [zoneId] = key.split(":");
      const ageDays = daysBetween(p.date, today);

      const zoneAbritee = ZONES.find((z) => z.id === zoneId)?.greenhouse;
      const pluiePertinente = !zoneAbritee && weather?.data?.pluieAujourdhui;

      if (ageDays >= 0 && ageDays <= 21 && ageDays % veg.arrosageJours === 0 && !pluiePertinente) {
        list.push({
          key: key + "-water-" + today,
          zoneId,
          zone: ZONES.find((z) => z.id === zoneId)?.nom,
          emoji: veg.emoji,
          nom: veg.nom,
          type: "arrosage",
          label: `Arroser : ${veg.nom}`,
          urgent: true,
        });
      }

      if (weather?.data?.risqueGel && FROST_SENSITIVE.has(veg.id)) {
        list.push({
          key: key + "-gel-" + today,
          zoneId,
          zone: ZONES.find((z) => z.id === zoneId)?.nom,
          emoji: "❄️",
          nom: veg.nom,
          type: "gel",
          label: `Risque de gel cette nuit : protège ${veg.nom} (voile, cloche...)`,
          urgent: true,
        });
      }

      const harvestDate = addDays(p.date, veg.recolteJours);
      const daysToHarvest = daysBetween(today, harvestDate);
      if (daysToHarvest <= 5 && daysToHarvest >= -14) {
        list.push({
          key: key + "-harvest-" + p.date,
          zoneId,
          vegetableId: veg.id,
          zone: ZONES.find((z) => z.id === zoneId)?.nom,
          emoji: veg.emoji,
          nom: veg.nom,
          type: "recolte",
          label:
            daysToHarvest > 0
              ? `Récolte de ${veg.nom} dans ${daysToHarvest} j`
              : daysToHarvest === 0
              ? `Récolte de ${veg.nom} aujourd'hui`
              : `Récolte de ${veg.nom} en retard (${-daysToHarvest} j)`,
          urgent: daysToHarvest <= 0,
        });
      }

      (veg.soins || []).forEach((soin, i) => {
        const soinDate = addDays(p.date, soin.jours);
        const daysToSoin = daysBetween(today, soinDate);
        if (daysToSoin <= 3) {
          list.push({
            key: key + "-soin-" + i + "-" + p.date,
            zoneId,
            zone: ZONES.find((z) => z.id === zoneId)?.nom,
            emoji: soin.emoji,
            nom: veg.nom,
            type: "soin",
            label:
              daysToSoin > 0
                ? `${soin.label} : ${veg.nom} (dans ${daysToSoin} j)`
                : daysToSoin === 0
                ? `${soin.label} : ${veg.nom} aujourd'hui`
                : `${soin.label} : ${veg.nom} (en retard de ${-daysToSoin} j)`,
            urgent: daysToSoin <= 0,
          });
        }
      });
    });

    Object.entries(emptySince).forEach(([key, since]) => {
      if (plantings[key]) return; // la case a été replantée depuis
      const daysEmpty = daysBetween(since, today);
      if (daysEmpty >= 14) {
        const [zoneId] = key.split(":");
        list.push({
          key: key + "-solnu",
          zoneId,
          zone: ZONES.find((z) => z.id === zoneId)?.nom,
          emoji: "🟫",
          nom: "Sol nu",
          type: "solnu",
          label: `Sol nu depuis ${daysEmpty} j — planter ou pailler`,
          urgent: daysEmpty >= 21,
        });
      }
    });

    return list
      .filter((t) => !doneTasks[t.key])
      .sort((a, b) => (a.urgent === b.urgent ? 0 : a.urgent ? -1 : 1));
  }, [plantings, emptySince, doneTasks, weather]);

  const markTaskDone = useCallback((key) => {
    setDoneTasks((prev) => ({ ...prev, [key]: true }));
  }, []);

  const gelTasks = tasks.filter((t) => t.type === "gel");

  const wateringTasks = tasks.filter((t) => t.type === "arrosage");
  const harvestTasks = tasks.filter((t) => t.type === "recolte");
  const soinTasks = tasks.filter((t) => t.type === "soin");
  const solNuTasks = tasks.filter((t) => t.type === "solnu");

  return (
    <div style={styles.app}>
      <style>{globalCss}</style>

      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Carnet de jardin · Venthône, {ALTITUDE} m</div>
          <h1 style={styles.title}>Mon potager</h1>
        </div>
        <div style={styles.saveIndicator} title="Statut de sauvegarde">
          <span style={{ ...styles.dot, background: saveState === "saved" ? "#5C7A5F" : saveState === "error" ? "#B5651D" : "#C1B99C" }} />
          {saveState === "saving" ? "Enregistrement…" : saveState === "error" ? "Non sauvegardé" : "À jour"}
        </div>
      </header>

      <nav style={styles.tabs}>
        {[
          ["jardin", "🗺️ Parcelle"],
          ["taches", `✅ Tâches${tasks.length ? ` (${tasks.length})` : ""}`],
          ["calendrier", "📆 Calendrier"],
          ["semis", "🌤️ Semis"],
          ["stats", "📊 Stats"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ ...styles.tab, ...(tab === id ? styles.tabActive : {}) }}>
            {label}
          </button>
        ))}
      </nav>

      {tab === "jardin" && (
        <JardinView activeZone={activeZone} setActiveZone={setActiveZone} plantings={plantings} setSelectedCell={setSelectedCell} />
      )}

      {tab === "taches" && (
        <TachesView
          wateringTasks={wateringTasks}
          harvestTasks={harvestTasks}
          soinTasks={soinTasks}
          solNuTasks={solNuTasks}
          gelTasks={gelTasks}
          weather={weather}
          onRefreshWeather={fetchWeather}
          onDone={markTaskDone}
          onLogHarvest={(t) =>
            setSelectedDay({
              date: todayISO(),
              prefill: { vegetableId: t.vegetableId, zoneId: t.zoneId },
            })
          }
        />
      )}

      {tab === "calendrier" && (
        <CalendrierMois plantings={plantings} harvests={harvests} onSelectDay={(date) => setSelectedDay({ date })} />
      )}

      {tab === "semis" && <SemisView />}

      {tab === "stats" && <StatsView harvests={harvests} onEdit={(h) => setSelectedDay({ date: h.date, editId: h.id })} onDelete={deleteHarvest} onExport={exportData} onImport={importData} />}

      {selectedCell && (
        <CellModal
          selectedCell={selectedCell}
          plantings={plantings}
          rotationHistory={rotationHistory}
          onClose={() => setSelectedCell(null)}
          onSave={(data) => {
            setCellPlanting(selectedCell.zoneId, selectedCell.r, selectedCell.c, data);
            setSelectedCell(null);
          }}
          onHarvest={(p) => {
            setSelectedCell(null);
            setSelectedDay({
              date: todayISO(),
              prefill: { vegetableId: p.vegetableId, zoneId: selectedCell.zoneId },
            });
          }}
        />
      )}

      {selectedDay && (
        <DayModal
          selectedDay={selectedDay}
          plantings={plantings}
          harvests={harvests}
          onClose={() => setSelectedDay(null)}
          onSaveHarvest={(entry) => {
            upsertHarvest(entry);
            setSelectedDay(null);
          }}
          onDeleteHarvest={(id) => deleteHarvest(id)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vue : parcelle / grille                                             */
/* ------------------------------------------------------------------ */

function JardinView({ activeZone, setActiveZone, plantings, setSelectedCell }) {
  const zone = ZONES.find((z) => z.id === activeZone);
  const [showCapacity, setShowCapacity] = useState(false);

  return (
    <div style={styles.section}>
      <div style={styles.zoneTabs}>
        {ZONES.map((z) => (
          <button key={z.id} onClick={() => setActiveZone(z.id)} style={{ ...styles.zoneTab, ...(activeZone === z.id ? styles.zoneTabActive : {}) }}>
            <span style={{ marginRight: 6 }}>{z.icon}</span>
            {z.nom}
          </button>
        ))}
      </div>

      <div style={styles.zoneInfoRow}>
        <div>
          <div style={styles.zoneName}>
            {zone.nom} {zone.greenhouse && <span style={styles.greenhouseBadge}>sous abri</span>}
          </div>
          <div style={styles.zoneSurface}>{zone.surface}</div>
        </div>
        <div style={styles.legend}>
          <span style={{ ...styles.legendDot, background: "#EDE8DA", border: "1px solid #D8D0BC" }} /> libre
          <span style={{ ...styles.legendDot, background: "#33513F", marginLeft: 14 }} /> planté
        </div>
      </div>

      <button style={styles.capacityToggle} onClick={() => setShowCapacity((s) => !s)}>
        {showCapacity ? "▾" : "▸"} Capacité de cette zone (densités PEBI)
      </button>

      {showCapacity && (
        <div style={styles.capacityPanel}>
          {CATALOGUE.map((v) => {
            const max = Math.round(zone.surfaceM2 * v.densiteM2);
            return (
              <div key={v.id} style={styles.capacityRow}>
                <span style={styles.capacityName}>{v.emoji} {v.nom}</span>
                <span style={styles.capacityValue}>
                  ~{max} {v.type === "row" ? "graines" : "plants"} max
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(${zone.cols}, 1fr)`,
          background: zone.greenhouse ? "linear-gradient(180deg, #EAF1EF, #E4EEEB)" : "transparent",
          border: zone.greenhouse ? "2px dashed #6E9C96" : "1px solid #D8D0BC",
        }}
      >
        {Array.from({ length: zone.rows }).map((_, r) =>
          Array.from({ length: zone.cols }).map((__, c) => {
            const key = cellKey(zone.id, r, c);
            const p = plantings[key];
            const veg = p ? CATALOGUE.find((v) => v.id === p.vegetableId) : null;
            const title = veg
              ? `${veg.nom}${p.quantity ? ` (${p.quantity})` : ""} — planté le ${p.date}`
              : "Case libre";
            return (
              <button
                key={key}
                onClick={() => setSelectedCell({ zoneId: zone.id, r, c })}
                style={{ ...styles.cell, background: veg ? "#33513F" : "#EDE8DA" }}
                title={title}
              >
                {veg ? veg.emoji : ""}
              </button>
            );
          })
        )}
      </div>
      <div style={styles.hint}>Chaque case ≈ 25 × 25 cm. Clique une case pour planter, modifier ou retirer.</div>
    </div>
  );
}

function CellModal({ selectedCell, plantings, rotationHistory, onClose, onSave, onHarvest }) {
  const key = cellKey(selectedCell.zoneId, selectedCell.r, selectedCell.c);
  const existing = plantings[key];
  const [vegetableId, setVegetableId] = useState(existing?.vegetableId || CATALOGUE[0].id);
  const [date, setDate] = useState(existing?.date || todayISO());
  const zone = ZONES.find((z) => z.id === selectedCell.zoneId);
  const veg = CATALOGUE.find((v) => v.id === vegetableId);
  const cellSurfaceM2 = 0.0625; // case ≈ 25 × 25 cm
  const [quantity, setQuantity] = useState(existing?.quantity || (veg?.type === "row" ? Math.max(1, Math.round(veg.densiteM2 * cellSurfaceM2)) : 1));

  const handleVegChange = (id) => {
    setVegetableId(id);
    const v = CATALOGUE.find((x) => x.id === id);
    if (v?.type === "row") setQuantity(Math.max(1, Math.round(v.densiteM2 * cellSurfaceM2)));
  };

  const rotationWarning = getRotationWarning(key, vegetableId, rotationHistory || {});
  const familleNom = FAMILLES[veg?.famille]?.nom;
  const voisins = (veg?.bonsVoisins || []).map((id) => CATALOGUE.find((v) => v.id === id)).filter(Boolean);
  const mauvaisVoisins = (veg?.mauvaisVoisins || []).map((id) => CATALOGUE.find((v) => v.id === id)).filter(Boolean);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.eyebrow}>
            {zone.nom} — case ({selectedCell.r + 1}, {selectedCell.c + 1})
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <label style={styles.label}>Légume</label>
        <select style={styles.select} value={vegetableId} onChange={(e) => handleVegChange(e.target.value)}>
          {CATALOGUE.map((v) => (
            <option key={v.id} value={v.id}>
              {v.emoji} {v.nom}
            </option>
          ))}
        </select>

        <label style={styles.label}>Date de plantation / semis</label>
        <input type="date" style={styles.select} value={date} onChange={(e) => setDate(e.target.value)} />

        {veg?.type === "row" && (
          <>
            <label style={styles.label}>Quantité (graines/plants dans cette case)</label>
            <input
              type="number"
              min="1"
              style={styles.select}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            />
          </>
        )}

        {rotationWarning && (
          <div style={styles.rotationWarning}>
            ⚠️ Rotation : un{familleNom?.toLowerCase().startsWith("a") ? "e" : ""} {rotationWarning.familleNom.toLowerCase()} ({rotationWarning.lastVegNom}) a occupé cette case il y a {rotationWarning.yearsSince} an{rotationWarning.yearsSince > 1 ? "s" : ""} — la méthode PEBI recommande {rotationWarning.rotationAns} ans avant de revenir à la même famille.
          </div>
        )}

        <div style={styles.densityBox}>
          <div style={styles.densityRow}><span>Famille botanique</span><strong>{familleNom}</strong></div>
          <div style={styles.densityRow}><span>Entre plants</span><strong>{veg?.distPlantsCm}</strong></div>
          <div style={styles.densityRow}><span>Entre rangs</span><strong>{veg?.distRangsCm}</strong></div>
          <div style={styles.densityRow}><span>Densité repère</span><strong>{veg?.densiteM2}/m²</strong></div>
        </div>
        <div style={styles.vegNote}>{veg?.repere}</div>

        {voisins.length > 0 && (
          <div style={styles.companionBox}>
            🤝 Bon(s) voisin(s) : {voisins.map((v) => `${v.emoji} ${v.nom}`).join(", ")}
          </div>
        )}

        {mauvaisVoisins.length > 0 && (
          <div style={styles.badCompanionBox}>
            🚫 À éviter à proximité : {mauvaisVoisins.map((v) => `${v.emoji} ${v.nom}`).join(", ")}
          </div>
        )}

        {existing && (
          <button style={styles.harvestBtn} onClick={() => onHarvest(existing)}>
            🧺 Enregistrer une récolte pour ce {CATALOGUE.find((v) => v.id === existing.vegetableId)?.nom.toLowerCase()}
          </button>
        )}

        <div style={styles.modalActions}>
          {existing && (
            <button style={styles.dangerBtn} onClick={() => onSave(null)}>
              Retirer
            </button>
          )}
          <button
            style={styles.primaryBtn}
            onClick={() => onSave({ vegetableId, date, quantity: veg?.type === "row" ? quantity : undefined })}
          >
            {existing ? "Mettre à jour" : "Planter ici"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vue : tâches                                                        */
/* ------------------------------------------------------------------ */

function TachesView({ wateringTasks, harvestTasks, soinTasks, solNuTasks, gelTasks, weather, onRefreshWeather, onDone, onLogHarvest }) {
  const allEmpty = wateringTasks.length === 0 && harvestTasks.length === 0 && soinTasks.length === 0 && solNuTasks.length === 0 && gelTasks.length === 0;

  return (
    <div style={styles.section}>
      <MeteoWidget weather={weather} onRefresh={onRefreshWeather} />
      <ConseilDuJour />

      {allEmpty && (
        <div style={styles.empty}>Aucune tâche pour l'instant. Plante quelque chose dans l'onglet Parcelle !</div>
      )}

      {gelTasks.length > 0 && (
        <>
          <h3 style={styles.taskGroupTitle}>❄️ Risque de gel cette nuit</h3>
          <div style={styles.taskList}>
            {gelTasks.map((t) => (
              <div key={t.key} style={{ ...styles.taskCard, borderColor: "#B5651D" }}>
                <span style={styles.taskEmoji}>{t.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={styles.taskLabel}>{t.label}</div>
                  <div style={styles.taskZone}>{t.zone}</div>
                </div>
                <button style={styles.doneBtn} onClick={() => onDone(t.key)}>✓ Fait</button>
              </div>
            ))}
          </div>
        </>
      )}

      {solNuTasks.length > 0 && (
        <>
          <h3 style={styles.taskGroupTitle}>🟫 Sol nu à traiter</h3>
          <div style={styles.taskList}>
            {solNuTasks.map((t) => (
              <div key={t.key} style={{ ...styles.taskCard, borderColor: t.urgent ? "#B5651D" : "#D8D0BC" }}>
                <span style={styles.taskEmoji}>{t.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={styles.taskLabel}>{t.label}</div>
                  <div style={styles.taskZone}>{t.zone}</div>
                </div>
                <button style={styles.doneBtn} onClick={() => onDone(t.key)}>✓ Fait</button>
              </div>
            ))}
          </div>
        </>
      )}

      {soinTasks.length > 0 && (
        <>
          <h3 style={styles.taskGroupTitle}>🪵 Soins à faire</h3>
          <div style={styles.taskList}>
            {soinTasks.map((t) => (
              <div key={t.key} style={{ ...styles.taskCard, borderColor: t.urgent ? "#B5651D" : "#D8D0BC" }}>
                <span style={styles.taskEmoji}>{t.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={styles.taskLabel}>{t.label}</div>
                  <div style={styles.taskZone}>{t.zone}</div>
                </div>
                <button style={styles.doneBtn} onClick={() => onDone(t.key)}>✓ Fait</button>
              </div>
            ))}
          </div>
        </>
      )}

      {wateringTasks.length > 0 && (
        <>
          <h3 style={styles.taskGroupTitle}>💧 À arroser aujourd'hui</h3>
          <div style={styles.taskList}>
            {wateringTasks.map((t) => (
              <div key={t.key} style={styles.taskCard}>
                <span style={styles.taskEmoji}>{t.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={styles.taskLabel}>{t.label}</div>
                  <div style={styles.taskZone}>{t.zone}</div>
                </div>
                <button style={styles.doneBtn} onClick={() => onDone(t.key)}>✓ Fait</button>
              </div>
            ))}
          </div>
        </>
      )}

      {harvestTasks.length > 0 && (
        <>
          <h3 style={styles.taskGroupTitle}>🧺 Récoltes à venir</h3>
          <div style={styles.taskList}>
            {harvestTasks.map((t) => (
              <div key={t.key} style={{ ...styles.taskCard, borderColor: t.urgent ? "#B5651D" : "#D8D0BC" }}>
                <span style={styles.taskEmoji}>{t.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={styles.taskLabel}>{t.label}</div>
                  <div style={styles.taskZone}>{t.zone}</div>
                </div>
                <span style={{ display: "flex", gap: 6 }}>
                  <button style={styles.smallBtn} onClick={() => onLogHarvest(t)}>Enregistrer</button>
                  <button style={styles.doneBtn} onClick={() => onDone(t.key)}>✓ Fait</button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const CONSEILS_MENSUELS = [
  "Janvier : c'est le moment de commander tes graines et de planifier ta saison sur le carnet de culture.",
  "Février : prépare tes semis en godets sous abri (tomates, aubergines, poivrons) pour prendre de l'avance.",
  "Mars : les premiers semis extérieurs peuvent commencer (radis, carottes, petits pois) si le sol le permet.",
  "Avril : surveille les gelées tardives avant de sortir tes plants fragiles, même en altitude.",
  "Mai : après les Saints de Glace, c'est la grande période de plantation en pleine terre.",
  "Juin : pense à pailler systématiquement après chaque plantation pour limiter l'arrosage.",
  "Juillet : arrose au pied, tôt le matin, et récolte régulièrement pour stimuler la production.",
  "Août : échelonne encore quelques semis d'automne (épinards, radis, mâche).",
  "Septembre : prépare les rotations de l'année prochaine et sème tes engrais verts sur les planches libres.",
  "Octobre : récolte les dernières cultures sensibles au gel et couvre le sol avant l'hiver.",
  "Novembre : plante l'ail et prépare le sol pour le printemps prochain.",
  "Décembre : profite de la pause hivernale pour faire le bilan de ta saison et planifier la suivante.",
];

// Détail "comment procéder" par mois, dans l'esprit des fiches du livre.
const CONSEILS_DETAILS = [
  ["Relis ton carnet de culture de l'année passée : réussites, échecs, erreurs à ne pas répéter.", "Commande tes graines en priorisant 5 à 6 légumes clés avant d'élargir la liste.", "Entretiens et affûte tes outils (sécateur, binette) pendant la pause hivernale."],
  ["Sème tomates, aubergines et poivrons en godets à l'intérieur, entre 20 et 25°C.", "Prépare une mini-pépinière pour les choux et poireaux à repiquer plus tard.", "Vérifie ton stock de terreau et de plaques alvéolées."],
  ["Sème en pleine terre dès que le sol n'est plus détrempé : radis, carottes, petits pois.", "Installe un voile P30 sur les semis fragiles pour les protéger du froid.", "Commence à pailler les planches déjà libres pour limiter les adventices."],
  ["Surveille la météo locale : à 850 m, les gelées tardives restent possibles jusqu'à mi-mai.", "Acclimate progressivement tes plants avant de les sortir définitivement (2-3 jours dehors le jour, rentrés la nuit).", "Poursuis les semis échelonnés de salades toutes les 3 semaines."],
  ["Attends la mi-mai en montagne avant de planter tomates, aubergines, poivrons et courges en pleine terre.", "Installe tuteurs et treillis avant ou juste après la plantation, pas après coup.", "Paille systématiquement chaque nouvelle plantation pour limiter le stress hydrique."],
  ["Arrose au pied, tôt le matin, jamais sur le feuillage pour éviter les maladies.", "Sème un engrais vert (phacélie, trèfle) sur toute planche qui se libère.", "Fais ta tournée hebdomadaire : désherbage court mais régulier plutôt qu'une grosse corvée."],
  ["Récolte tous les 2-3 jours : ça stimule la production plutôt que de la ralentir.", "Surveille les ravageurs 2 fois par semaine (pucerons, altises, doryphores).", "En cas de canicule, arrose profondément mais moins souvent pour renforcer les racines."],
  ["Échelonne encore des semis d'automne : épinards, radis, mâche.", "Paille généreusement pour limiter le stress hydrique de fin d'été.", "Sur les aubergines, pince les fleurs en fin de saison pour concentrer l'énergie sur les fruits existants."],
  ["Sème tes engrais verts (phacélie, seigle, vesce) sur toutes les planches qui se libèrent.", "Prépare déjà tes rotations de l'an prochain en notant ce qui a poussé où.", "Continue de récolter et de noter tes observations dans le carnet de culture."],
  ["Récolte les dernières cultures sensibles au gel avant les premières nuits froides.", "Couvre le sol nu avec du paillage épais avant l'hiver.", "Rentre ou protège le matériel fragile (voiles, arrosoirs) pour l'hiver."],
  ["C'est la période idéale pour planter l'ail, en terre ou en pot retourné pour l'hiver.", "Termine le paillage hivernal de toutes les planches encore nues.", "Nettoie et entretiens le compost une dernière fois avant le froid."],
  ["Fais le bilan complet de ta saison : rendements, échecs, ce qui a bien marché.", "Planifie tes rotations et ton plan de plantation pour l'année suivante.", "Profite de la pause pour lire, comparer des variétés et rêver un peu le prochain jardin."],
];

function formatHeureMaj(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function MeteoWidget({ weather, onRefresh }) {
  const data = weather?.data;
  const loading = weather?.loading;
  const error = weather?.error;

  return (
    <div style={styles.meteoBox}>
      <div style={styles.meteoHeader}>
        <span style={styles.meteoTitle}>🌦️ Météo — Venthône</span>
        <button style={styles.meteoRefreshBtn} onClick={onRefresh} disabled={loading}>
          {loading ? "Recherche…" : data ? "Actualiser" : "Vérifier la météo"}
        </button>
      </div>

      {error && <div style={styles.meteoError}>{error}</div>}

      {!data && !loading && !error && (
        <div style={styles.meteoHint}>Appuie sur "Vérifier la météo" pour que l'appli aille chercher les prévisions et ajuste tes tâches d'arrosage automatiquement.</div>
      )}

      {data && (
        <>
          <div style={styles.meteoResume}>{data.resume}</div>
          <div style={styles.meteoTags}>
            {data.temperatureActuelle != null && <span style={styles.meteoTag}>🌡️ {data.temperatureActuelle}°C</span>}
            {data.pluieAujourdhui && <span style={styles.meteoTagAlert}>🌧️ Pluie aujourd'hui</span>}
            {!data.pluieAujourdhui && data.pluieDemain && <span style={styles.meteoTag}>🌧️ Pluie demain</span>}
            {data.risqueGel && <span style={styles.meteoTagAlert}>❄️ Risque de gel</span>}
            {data.risqueCanicule && <span style={styles.meteoTagAlert}>🥵 Canicule</span>}
            {data.risqueOrage && <span style={styles.meteoTagAlert}>⛈️ Orage possible</span>}
          </div>
          {data.pluieAujourdhui && (
            <div style={styles.meteoNote}>💧 Arrosage extérieur masqué aujourd'hui grâce à la pluie prévue — la serre, elle, reste à arroser normalement.</div>
          )}
          <div style={styles.meteoUpdated}>Mis à jour à {formatHeureMaj(weather.updatedAt)}</div>
        </>
      )}
    </div>
  );
}

function ConseilDuJour() {
  const mois = new Date().getMonth();
  const [ouvert, setOuvert] = useState(false);
  return (
    <div style={styles.conseilBox}>
      <button style={styles.conseilToggle} onClick={() => setOuvert((o) => !o)}>
        <span>💡 <strong>Conseil du mois</strong> — {CONSEILS_MENSUELS[mois]}</span>
        <span style={styles.conseilChevron}>{ouvert ? "▾" : "▸"}</span>
      </button>
      {ouvert && (
        <ul style={styles.conseilDetailList}>
          {CONSEILS_DETAILS[mois].map((d, i) => (
            <li key={i} style={styles.conseilDetailItem}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vue : calendrier réel (mois, aujourd'hui, journal des événements)   */
/* ------------------------------------------------------------------ */

function CalendrierMois({ plantings, harvests, onSelectDay }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const plantingsByDay = useMemo(() => {
    const map = {};
    Object.values(plantings).forEach((p) => {
      map[p.date] = (map[p.date] || 0) + 1;
    });
    return map;
  }, [plantings]);

  const harvestsByDay = useMemo(() => {
    const map = {};
    harvests.forEach((h) => {
      map[h.date] = (map[h.date] || 0) + 1;
    });
    return map;
  }, [harvests]);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const changeMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const todayIso = todayISO();

  return (
    <div style={styles.section}>
      <div style={styles.todayBanner}>
        Aujourd'hui : <strong>{JOURS_LONG[today.getDay()]} {today.getDate()} {MOIS_LONG[today.getMonth()]} {today.getFullYear()}</strong>
      </div>

      <div style={styles.calNav}>
        <button style={styles.navBtn} onClick={() => changeMonth(-1)}>‹</button>
        <div style={styles.calNavLabel}>{MOIS_LONG[viewMonth]} {viewYear}</div>
        <button style={styles.navBtn} onClick={() => changeMonth(1)}>›</button>
      </div>

      <div style={styles.weekRow}>
        {JOURS_COURT.map((j) => (
          <div key={j} style={styles.weekDay}>{j}</div>
        ))}
      </div>

      <div style={styles.monthGrid}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} style={styles.dayCellEmpty} />;
          const iso = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(d)}`;
          const isToday = iso === todayIso;
          const nPlant = plantingsByDay[iso] || 0;
          const nHarvest = harvestsByDay[iso] || 0;
          return (
            <button key={i} onClick={() => onSelectDay(iso)} style={{ ...styles.dayCell, ...(isToday ? styles.dayCellToday : {}) }}>
              <span style={styles.dayNum}>{d}</span>
              <span style={styles.dayDots}>
                {nPlant > 0 && <i style={{ ...styles.dotSmall, background: "#33513F" }} />}
                {nHarvest > 0 && <i style={{ ...styles.dotSmall, background: "#E4A63A" }} />}
              </span>
            </button>
          );
        })}
      </div>

      <div style={styles.calLegend}>
        <span><i style={{ ...styles.calSwatch, background: "#33513F" }} /> Plantation / semis</span>
        <span><i style={{ ...styles.calSwatch, background: "#E4A63A" }} /> Récolte enregistrée</span>
      </div>
      <div style={styles.hint}>Clique un jour pour voir le détail, ou pour ajouter une récolte — même dans le passé.</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modale : détail d'un jour + ajout/édition de récolte                */
/* ------------------------------------------------------------------ */

function DayModal({ selectedDay, plantings, harvests, onClose, onSaveHarvest, onDeleteHarvest }) {
  const { date, editId, prefill } = selectedDay;
  const editing = editId ? harvests.find((h) => h.id === editId) : null;

  const [showForm, setShowForm] = useState(!!editing || !!prefill);
  const [vegetableId, setVegetableId] = useState(editing?.vegetableId || prefill?.vegetableId || CATALOGUE[0].id);
  const [quantity, setQuantity] = useState(editing?.quantity ?? 1);
  const [unit, setUnit] = useState(editing?.unit || CATALOGUE.find((v) => v.id === (prefill?.vegetableId || CATALOGUE[0].id))?.uniteDefaut || "pièces");
  const [note, setNote] = useState(editing?.note || "");
  const [entryDate, setEntryDate] = useState(editing?.date || date);

  const dayPlantings = Object.entries(plantings)
    .filter(([, p]) => p.date === date)
    .map(([key, p]) => ({ key, ...p, veg: CATALOGUE.find((v) => v.id === p.vegetableId) }));

  const dayHarvests = harvests.filter((h) => h.date === date);

  const d = new Date(date + "T00:00:00");

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.eyebrow}>{JOURS_LONG[d.getDay()]}</div>
            <div style={styles.modalDate}>{d.getDate()} {MOIS_LONG[d.getMonth()]} {d.getFullYear()}</div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {dayPlantings.length > 0 && (
          <div style={styles.dayBlock}>
            <div style={styles.dayBlockTitle}>🌱 Planté ce jour-là</div>
            {dayPlantings.map((p) => (
              <div key={p.key} style={styles.dayEntry}>
                {p.veg?.emoji} {p.veg?.nom} — {ZONES.find((z) => z.id === p.key.split(":")[0])?.nom}
              </div>
            ))}
          </div>
        )}

        {dayHarvests.length > 0 && (
          <div style={styles.dayBlock}>
            <div style={styles.dayBlockTitle}>🧺 Récoltes enregistrées</div>
            {dayHarvests.map((h) => {
              const veg = CATALOGUE.find((v) => v.id === h.vegetableId);
              return (
                <div key={h.id} style={styles.dayEntryRow}>
                  <span>
                    {veg?.emoji} {h.quantity} {h.unit} de {veg?.nom}
                    {h.note ? ` — ${h.note}` : ""}
                  </span>
                  <span style={{ display: "flex", gap: 6 }}>
                    <button
                      style={styles.linkBtn}
                      onClick={() => {
                        setVegetableId(h.vegetableId);
                        setQuantity(h.quantity);
                        setUnit(h.unit);
                        setNote(h.note || "");
                        setEntryDate(h.date);
                        setShowForm(true);
                      }}
                    >
                      Modifier
                    </button>
                    <button style={styles.linkBtnDanger} onClick={() => onDeleteHarvest(h.id)}>
                      Suppr.
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {!showForm && (
          <button style={styles.primaryBtn} onClick={() => setShowForm(true)}>
            + Ajouter une récolte
          </button>
        )}

        {showForm && (
          <div style={styles.dayBlock}>
            <div style={styles.dayBlockTitle}>{editing ? "Modifier la récolte" : "Nouvelle récolte"}</div>

            <label style={styles.label}>Date de récolte</label>
            <input type="date" style={styles.select} value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />

            <label style={styles.label}>Légume</label>
            <select
              style={styles.select}
              value={vegetableId}
              onChange={(e) => {
                setVegetableId(e.target.value);
                setUnit(CATALOGUE.find((v) => v.id === e.target.value)?.uniteDefaut || "pièces");
              }}
            >
              {CATALOGUE.map((v) => (
                <option key={v.id} value={v.id}>{v.emoji} {v.nom}</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Quantité</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  style={styles.select}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Unité</label>
                <select style={styles.select} value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {UNITES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <label style={styles.label}>Note (facultatif)</label>
            <input type="text" style={styles.select} value={note} onChange={(e) => setNote(e.target.value)} placeholder="ex : belle récolte malgré la sécheresse" />

            <div style={styles.modalActions}>
              <button
                style={styles.primaryBtn}
                onClick={() =>
                  onSaveHarvest({
                    id: editing?.id || uid(),
                    date: entryDate,
                    vegetableId,
                    quantity: Number(quantity) || 0,
                    unit,
                    note,
                  })
                }
              >
                {editing ? "Mettre à jour" : "Enregistrer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vue : calendrier saisonnier (semis, ajusté à l'altitude)            */
/* ------------------------------------------------------------------ */

function SemisView() {
  return (
    <div style={styles.section}>
      <div style={styles.calNote}>
        Périodes ajustées pour {ALTITUDE} m d'altitude (Venthône) — environ 2 à 3 semaines plus tard qu'en plaine.
        Dernier gel probable : mi-mai. Premier gel : mi-octobre.
      </div>

      <div style={styles.calTableWrap}>
        <table style={styles.calTable}>
          <thead>
            <tr>
              <th style={styles.calTh}>Légume</th>
              {MOIS.map((m) => (
                <th key={m} style={styles.calThMonth}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATALOGUE.map((v) => (
              <tr key={v.id}>
                <td style={styles.calTdName}>{v.emoji} {v.nom}</td>
                {MOIS.map((_, i) => {
                  const inSerre = v.semisSerre?.includes(i);
                  const inExt = v.semisExt?.includes(i);
                  const inPlant = v.plantationExt?.includes(i);
                  let bg = "transparent";
                  let label = "";
                  if (inSerre) { bg = "#6E9C96"; label = "semis serre"; }
                  else if (inPlant) { bg = "#33513F"; label = "plantation"; }
                  else if (inExt) { bg = "#E4A63A"; label = "semis extérieur"; }
                  return <td key={i} style={{ ...styles.calTd, background: bg }} title={label}></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.calLegend}>
        <span><i style={{ ...styles.calSwatch, background: "#6E9C96" }} /> Semis sous serre</span>
        <span><i style={{ ...styles.calSwatch, background: "#E4A63A" }} /> Semis extérieur</span>
        <span><i style={{ ...styles.calSwatch, background: "#33513F" }} /> Plantation / repiquage</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vue : statistiques annuelles                                        */
/* ------------------------------------------------------------------ */

function StatsView({ harvests, onEdit, onDelete, onExport, onImport }) {
  const years = useMemo(() => {
    const set = new Set(harvests.map((h) => h.date.slice(0, 4)));
    set.add(String(new Date().getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [harvests]);

  const [year, setYear] = useState(years[0]);

  const yearHarvests = harvests.filter((h) => h.date.startsWith(year)).sort((a, b) => (a.date < b.date ? 1 : -1));

  const totals = useMemo(() => {
    const map = {};
    yearHarvests.forEach((h) => {
      const k = h.vegetableId + "|" + h.unit;
      map[k] = (map[k] || 0) + Number(h.quantity);
    });
    return Object.entries(map)
      .map(([k, total]) => {
        const [vegetableId, unit] = k.split("|");
        return { vegetableId, unit, total, veg: CATALOGUE.find((v) => v.id === vegetableId) };
      })
      .sort((a, b) => b.total - a.total);
  }, [yearHarvests]);

  const maxTotal = Math.max(1, ...totals.map((t) => t.total));

  return (
    <div style={styles.section}>
      <div style={styles.yearSelectorRow}>
        <label style={styles.label}>Année</label>
        <select style={{ ...styles.select, width: "auto" }} value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {totals.length === 0 && <div style={styles.empty}>Aucune récolte enregistrée pour {year}.</div>}

      {totals.length > 0 && (
        <div style={styles.statsChart}>
          {totals.map((t) => (
            <div key={t.vegetableId + t.unit} style={styles.statsRow}>
              <div style={styles.statsLabel}>{t.veg?.emoji} {t.veg?.nom}</div>
              <div style={styles.statsBarTrack}>
                <div style={{ ...styles.statsBarFill, width: `${(t.total / maxTotal) * 100}%` }} />
              </div>
              <div style={styles.statsValue}>{t.total} {t.unit}</div>
            </div>
          ))}
        </div>
      )}

      {yearHarvests.length > 0 && (
        <>
          <h3 style={styles.taskGroupTitle}>Détail des récoltes {year}</h3>
          <div style={styles.taskList}>
            {yearHarvests.map((h) => {
              const veg = CATALOGUE.find((v) => v.id === h.vegetableId);
              return (
                <div key={h.id} style={styles.taskCard}>
                  <span style={styles.taskEmoji}>{veg?.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={styles.taskLabel}>{h.quantity} {h.unit} de {veg?.nom}</div>
                    <div style={styles.taskZone}>{h.date}{h.note ? ` — ${h.note}` : ""}</div>
                  </div>
                  <span style={{ display: "flex", gap: 6 }}>
                    <button style={styles.linkBtn} onClick={() => onEdit(h)}>Modifier</button>
                    <button style={styles.linkBtnDanger} onClick={() => onDelete(h.id)}>Suppr.</button>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <BackupSection onExport={onExport} onImport={onImport} />
    </div>
  );
}

function BackupSection({ onExport, onImport }) {
  const fileInputRef = React.useRef(null);
  return (
    <div style={styles.backupBox}>
      <h3 style={styles.taskGroupTitle}>💾 Sauvegarde / transfert</h3>
      <div style={styles.backupText}>
        Utile avant de changer de téléphone, ou juste pour garder une copie de secours de tes données (plantations, récoltes, historique).
      </div>
      <div style={styles.backupActions}>
        <button style={styles.doneBtn} onClick={onExport}>⬇️ Exporter mes données</button>
        <button style={styles.doneBtn} onClick={() => fileInputRef.current?.click()}>⬆️ Importer une sauvegarde</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            e.target.value = "";
          }}
        />
      </div>
      <div style={styles.backupWarning}>⚠️ Importer une sauvegarde remplace toutes les données actuellement sur cet appareil.</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const globalCss = `
  * { box-sizing: border-box; }
  button { font-family: inherit; cursor: pointer; }
  select, input { font-family: inherit; }
`;

const styles = {
  app: {
    fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', serif",
    background: "#F2EEE3",
    color: "#2B2E26",
    minHeight: "100%",
    padding: "20px 18px 40px",
    maxWidth: 720,
    margin: "0 auto",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #33513F", paddingBottom: 12, marginBottom: 16 },
  eyebrow: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6E6752", marginBottom: 2 },
  title: { margin: 0, fontSize: 28, color: "#33513F", fontWeight: 700 },
  saveIndicator: { display: "flex", alignItems: "center", gap: 6, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 12, color: "#6E6752" },
  dot: { width: 7, height: 7, borderRadius: "50%", display: "inline-block" },
  tabs: { display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" },
  tab: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "8px 14px", borderRadius: 20, border: "1px solid #D8D0BC", background: "transparent", color: "#4A4636", fontSize: 13.5 },
  tabActive: { background: "#33513F", color: "#F2EEE3", borderColor: "#33513F" },
  section: {},
  zoneTabs: { display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" },
  zoneTab: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: "7px 12px", borderRadius: 8, border: "1px solid #D8D0BC", background: "#fff8", fontSize: 13, color: "#4A4636" },
  zoneTabActive: { background: "#EDE3C9", borderColor: "#B5651D", color: "#2B2E26", fontWeight: 700 },
  zoneInfoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  zoneName: { fontSize: 15, fontWeight: 700, color: "#33513F" },
  greenhouseBadge: { fontSize: 10.5, background: "#6E9C96", color: "#fff", padding: "2px 7px", borderRadius: 10, marginLeft: 6, verticalAlign: "middle" },
  zoneSurface: { fontSize: 12.5, color: "#6E6752" },
  legend: { fontSize: 11.5, color: "#6E6752", display: "flex", alignItems: "center" },
  legendDot: { width: 10, height: 10, display: "inline-block", borderRadius: 2, marginRight: 4, verticalAlign: "middle" },
  capacityToggle: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "none", border: "none", color: "#33513F", fontSize: 12.5, fontWeight: 600, padding: "4px 0", marginBottom: 6, textAlign: "left" },
  capacityPanel: { background: "#fff", border: "1px solid #D8D0BC", borderRadius: 8, padding: "8px 12px", marginBottom: 12, maxHeight: 220, overflowY: "auto" },
  capacityRow: { display: "flex", justifyContent: "space-between", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 12.5, padding: "4px 0", borderBottom: "1px solid #F2EEE3" },
  capacityName: { color: "#2B2E26" },
  capacityValue: { color: "#6E6752" },
  densityBox: { background: "#fff", border: "1px solid #D8D0BC", borderRadius: 6, padding: "8px 10px", marginTop: 10, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  densityRow: { display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#4A4636", padding: "2px 0" },
  rotationWarning: { background: "#FBE9DD", border: "1px solid #B5651D", borderRadius: 6, padding: "8px 10px", marginTop: 10, fontSize: 12, color: "#7A3E14", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", lineHeight: 1.4 },
  companionBox: { background: "#EAF1EF", border: "1px solid #6E9C96", borderRadius: 6, padding: "7px 10px", marginTop: 8, fontSize: 12, color: "#2B4A46", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  badCompanionBox: { background: "#FBE9DD", border: "1px solid #B5651D", borderRadius: 6, padding: "7px 10px", marginTop: 8, fontSize: 12, color: "#7A3E14", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  grid: { display: "grid", gap: 3, padding: 8, borderRadius: 8 },
  cell: { aspectRatio: "1 / 1", border: "1px solid #D8D0BC", borderRadius: 3, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 },
  hint: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 11.5, color: "#8A8266", marginTop: 8 },
  overlay: { position: "fixed", inset: 0, background: "rgba(43,46,38,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 },
  modal: { background: "#F2EEE3", borderRadius: 10, padding: 20, width: "100%", maxWidth: 360, maxHeight: "85vh", overflowY: "auto", border: "1px solid #D8D0BC", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  modalDate: { fontSize: 17, fontWeight: 700, color: "#33513F", fontFamily: "Georgia, serif" },
  closeBtn: { background: "none", border: "none", fontSize: 16, color: "#6E6752" },
  label: { display: "block", fontSize: 12, color: "#6E6752", marginTop: 10, marginBottom: 4 },
  select: { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #D8D0BC", background: "#fff", fontSize: 14 },
  vegNote: { fontSize: 12, color: "#6E6752", marginTop: 8, fontStyle: "italic" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 },
  primaryBtn: { background: "#33513F", color: "#fff", border: "none", borderRadius: 6, padding: "9px 16px", fontSize: 13.5, fontWeight: 600, width: "100%" },
  dangerBtn: { background: "transparent", color: "#B5651D", border: "1px solid #B5651D", borderRadius: 6, padding: "9px 14px", fontSize: 13.5 },
  harvestBtn: { width: "100%", marginTop: 12, background: "#EDE3C9", color: "#2B2E26", border: "1px solid #E4A63A", borderRadius: 6, padding: "9px 12px", fontSize: 13, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  smallBtn: { background: "#EDE3C9", color: "#2B2E26", border: "1px solid #B5651D", borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  doneBtn: { background: "#EAF1EF", color: "#2B4A46", border: "1px solid #6E9C96", borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", whiteSpace: "nowrap" },
  linkBtn: { background: "none", border: "none", color: "#33513F", fontSize: 12, textDecoration: "underline", padding: 0 },
  linkBtnDanger: { background: "none", border: "none", color: "#B5651D", fontSize: 12, textDecoration: "underline", padding: 0 },
  empty: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#6E6752", fontSize: 14, padding: "30px 0", textAlign: "center" },
  taskGroupTitle: { fontSize: 15, color: "#33513F", marginTop: 18, marginBottom: 8 },
  taskList: { display: "flex", flexDirection: "column", gap: 8 },
  taskCard: { display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #D8D0BC", borderRadius: 8, padding: "10px 12px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  taskEmoji: { fontSize: 20 },
  taskLabel: { fontSize: 14, fontWeight: 600, color: "#2B2E26" },
  taskZone: { fontSize: 12, color: "#6E6752" },
  calNote: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 12.5, color: "#6E6752", marginBottom: 14, lineHeight: 1.5 },
  calTableWrap: { overflowX: "auto" },
  calTable: { borderCollapse: "collapse", width: "100%", minWidth: 620 },
  calTh: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", textAlign: "left", fontSize: 11, color: "#6E6752", padding: "4px 8px 4px 0" },
  calThMonth: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 10.5, color: "#6E6752", fontWeight: 400, width: 30 },
  calTdName: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 12.5, whiteSpace: "nowrap", padding: "4px 8px 4px 0" },
  calTd: { border: "1px solid #F2EEE3", height: 20 },
  calLegend: { display: "flex", gap: 16, marginTop: 12, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 11.5, color: "#6E6752", flexWrap: "wrap" },
  calSwatch: { width: 10, height: 10, display: "inline-block", borderRadius: 2, marginRight: 4, verticalAlign: "middle" },
  todayBanner: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 13.5, color: "#4A4636", background: "#EDE3C9", border: "1px solid #D8D0BC", borderRadius: 8, padding: "9px 12px", marginBottom: 14 },
  meteoBox: { background: "#fff", border: "1px solid #D8D0BC", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  meteoHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  meteoTitle: { fontSize: 13.5, fontWeight: 700, color: "#33513F" },
  meteoRefreshBtn: { background: "#EAF1EF", border: "1px solid #6E9C96", borderRadius: 6, padding: "5px 10px", fontSize: 11.5, color: "#2B4A46", whiteSpace: "nowrap" },
  meteoHint: { fontSize: 12, color: "#6E6752", marginTop: 8, lineHeight: 1.4 },
  meteoError: { fontSize: 12, color: "#B5651D", marginTop: 8 },
  meteoResume: { fontSize: 12.5, color: "#2B2E26", marginTop: 8, lineHeight: 1.4 },
  meteoTags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 },
  meteoTag: { background: "#EAF1EF", border: "1px solid #D8D0BC", borderRadius: 12, padding: "3px 9px", fontSize: 11.5, color: "#2B4A46" },
  meteoTagAlert: { background: "#FBE9DD", border: "1px solid #B5651D", borderRadius: 12, padding: "3px 9px", fontSize: 11.5, color: "#7A3E14" },
  meteoNote: { fontSize: 11.5, color: "#2B4A46", marginTop: 8, fontStyle: "italic" },
  meteoUpdated: { fontSize: 10.5, color: "#8A8266", marginTop: 8 },
  conseilBox: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 13, color: "#2B4A46", lineHeight: 1.5, background: "#EAF1EF", border: "1px solid #6E9C96", borderRadius: 8, padding: "10px 12px", marginBottom: 16 },
  conseilToggle: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, width: "100%", background: "none", border: "none", padding: 0, textAlign: "left", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 13, color: "#2B4A46", lineHeight: 1.5 },
  conseilChevron: { flexShrink: 0, color: "#6E9C96", fontSize: 13, marginTop: 1 },
  conseilDetailList: { margin: "10px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 },
  conseilDetailItem: { fontSize: 12.5, color: "#2B4A46", lineHeight: 1.4 },
  calNav: { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 10 },
  navBtn: { background: "none", border: "1px solid #D8D0BC", borderRadius: 6, width: 30, height: 30, fontSize: 16, color: "#33513F" },
  calNavLabel: { fontSize: 16, fontWeight: 700, color: "#33513F", minWidth: 140, textAlign: "center" },
  weekRow: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 },
  weekDay: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 11, color: "#8A8266", textAlign: "center" },
  monthGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 },
  dayCellEmpty: { aspectRatio: "1 / 1" },
  dayCell: { aspectRatio: "1 / 1", border: "1px solid #D8D0BC", borderRadius: 6, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 2, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  dayCellToday: { border: "2px solid #33513F", background: "#EAF1EF" },
  dayNum: { fontSize: 12.5, color: "#2B2E26" },
  dayDots: { display: "flex", gap: 2, height: 6, marginTop: 2 },
  dotSmall: { width: 5, height: 5, borderRadius: "50%", display: "inline-block" },
  dayBlock: { marginTop: 14, paddingTop: 12, borderTop: "1px solid #D8D0BC" },
  dayBlockTitle: { fontSize: 13, fontWeight: 700, color: "#33513F", marginBottom: 8 },
  dayEntry: { fontSize: 13, color: "#2B2E26", marginBottom: 4 },
  dayEntryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#2B2E26", marginBottom: 6, gap: 8 },
  yearSelectorRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  statsChart: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 },
  statsRow: { display: "grid", gridTemplateColumns: "110px 1fr 70px", alignItems: "center", gap: 8, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  statsLabel: { fontSize: 12.5, color: "#2B2E26" },
  statsBarTrack: { background: "#EDE8DA", borderRadius: 4, height: 14, overflow: "hidden" },
  statsBarFill: { background: "#33513F", height: "100%", borderRadius: 4 },
  statsValue: { fontSize: 12.5, color: "#6E6752", textAlign: "right" },
  backupBox: { marginTop: 24, paddingTop: 16, borderTop: "1px solid #D8D0BC" },
  backupText: { fontSize: 12, color: "#6E6752", marginBottom: 10, lineHeight: 1.4, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  backupActions: { display: "flex", gap: 8, flexWrap: "wrap" },
  backupWarning: { fontSize: 11, color: "#B5651D", marginTop: 8, fontStyle: "italic" },
};
