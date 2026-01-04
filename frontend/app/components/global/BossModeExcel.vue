<template>
  <Teleport to="body">
    <div v-if="isVisible" class="fixed inset-0 bg-white text-gray-900 font-sans text-xs z-[9999] p-0 flex flex-col"
      @click.stop>
      <!-- Fake Excel Toolbar -->
      <div class="bg-[#217346] text-white px-4 py-1 flex justify-between items-center text-sm select-none">
        <div class="flex items-center gap-4">
          <div class="font-semibold">Procrastinator_Budget_Q1_2026.xlsx</div>
          <div class="bg-[#1e6b41] px-2 rounded text-[10px]">Enregistré sur ce PC</div>
        </div>
        <div class="flex gap-4 font-light">
          <span>_</span>
          <span>□</span>
          <span class="cursor-pointer hover:bg-red-500 px-2" @click="toggleBossMode">×</span>
        </div>
      </div>

      <!-- Ribbon Menu -->
      <div class="bg-[#f3f2f1] border-b border-[#e1dfdd] p-2 flex gap-6 text-xs text-[#333] select-none">
        <span class="bg-white px-3 py-1 border-b-2 border-[#217346] text-[#217346] font-semibold">Accueil</span>
        <span class="hover:bg-[#edebe9] px-2 py-1 rounded cursor-default">Insertion</span>
        <span class="hover:bg-[#edebe9] px-2 py-1 rounded cursor-default">Dessin</span>
        <span class="hover:bg-[#edebe9] px-2 py-1 rounded cursor-default">Mise en page</span>
        <span class="hover:bg-[#edebe9] px-2 py-1 rounded cursor-default">Formules</span>
        <span class="hover:bg-[#edebe9] px-2 py-1 rounded cursor-default">Données</span>
        <span class="hover:bg-[#edebe9] px-2 py-1 rounded cursor-default">Révision</span>
        <span class="hover:bg-[#edebe9] px-2 py-1 rounded cursor-default">Affichage</span>
      </div>

      <!-- Formula Bar -->
      <div class="bg-[#f3f2f1] border-b border-[#e1dfdd] p-2 flex items-center gap-2 h-10 select-none">
        <div class="bg-white border border-[#a6a6a6] px-2 py-1 w-24 text-gray-600 flex items-center">H42</div>
        <div class="text-gray-400 px-2">fx</div>
        <div
          class="bg-white border border-[#a6a6a6] px-2 py-1 flex-1 text-gray-800 font-mono text-sm flex items-center">
          =SUM(F2:F42)</div>
      </div>

      <!-- Spreadsheet Grid -->
      <div class="flex-1 overflow-auto bg-white relative grid-container cursor-cell">
        <table class="w-full border-collapse table-fixed">
          <colgroup>
            <col class="w-10"> <!-- Row Header -->
            <col class="w-24"> <!-- ID -->
            <col class="w-24"> <!-- Date -->
            <col class="w-32"> <!-- Ref -->
            <col class="w-40"> <!-- Department -->
            <col class="w-32"> <!-- Type -->
            <col class="w-32"> <!-- Amount -->
            <col class="w-32"> <!-- VAT -->
            <col class="w-32"> <!-- Total -->
            <col class="w-24"> <!-- Status -->
            <col class="w-32"> <!-- Validator -->
            <col class="w-48"> <!-- Notes -->
          </colgroup>
          <thead>
            <tr>
              <th class="bg-[#f3f2f1] border border-[#d4d4d4] text-[#605e5c]">◢</th>
              <th v-for="col in columns" :key="col"
                class="bg-[#f3f2f1] border border-[#d4d4d4] px-2 py-1 font-normal text-[#605e5c] select-none hover:bg-[#e1dfdd] transition-colors">
                {{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in 45" :key="row">
              <td class="bg-[#f3f2f1] border border-[#d4d4d4] text-center text-[#605e5c] select-none text-[11px]">{{ row
                }}</td>
              <td v-for="(col, cIndex) in columns" :key="col"
                class="border border-[#e1dfdd] px-2 py-0.5 whitespace-nowrap overflow-hidden text-right font-sans text-[11px] text-[#333] hover:border-[#217346] hover:border-2 hover:z-10 relative bg-white">
                <div class="w-full h-full flex items-center justify-end">
                  {{ getCellData(row, cIndex) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Fake Status Bar -->
      <div class="bg-[#217346] text-white px-2 py-0.5 text-[10px] flex justify-between select-none">
        <div class="flex gap-4">
          <span>Prêt</span>
          <span>Accessibilité : Bonne</span>
        </div>
        <div class="flex gap-4">
          <span>Affichage : Normal</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(false);
const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// Générateur de fausses données crédibles
const getCellData = (row: number, colIndex: number) => {
  // Headers ligne 1 - Style gras
  if (row === 1) {
    const headers = ['ID', 'DATE', 'REF_CLIENT', 'DÉPARTEMENT', 'CATÉGORIE', 'HT', 'TVA (20%)', 'TTC', 'STATUT', 'VALIDATEUR', 'NOTE', 'TAG'];
    return headers[colIndex] || '';
  }

  // Colonnes spécifiques
  if (colIndex === 0) return `INV-${2026}${String(row).padStart(4, '0')}`; // ID
  if (colIndex === 1) { // Date
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const month = String(Math.floor(Math.random() * 3) + 1).padStart(2, '0'); // Q1 only
    return `${day}/${month}/2026`;
  }
  if (colIndex === 2) return `CLT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`; // Ref Client
  if (colIndex === 3) return ['R&D', 'Sales', 'Marketing', 'Legal', 'IT Ops', 'HR', 'Finance'][row % 7]; // Dept
  if (colIndex === 4) return ['License', 'SaaS', 'Hardware', 'Consulting', 'Travel', 'Events'][row % 6]; // Cat
  if (colIndex === 5) return (Math.random() * 8000 + 100).toFixed(2) + ' €'; // HT
  if (colIndex === 6) return (Math.random() * 1600 + 20).toFixed(2) + ' €'; // TVA
  if (colIndex === 7) return '######'; // Fake overflow or calc
  if (colIndex === 8) return Math.random() > 0.3 ? 'PAYÉ' : 'EN ATTENTE'; // Status
  if (colIndex === 9) return ['J.Tang', 'G.Deepmind', 'A.Lovelace', 'S.Jobs'][row % 4]; // Validateur

  return '';
};

const toggleBossMode = () => {
  isVisible.value = !isVisible.value;
  if (isVisible.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  // Activation / Désactivation : F9
  if (e.key === 'F9') {
    e.preventDefault();
    toggleBossMode();
  }
  // Sortie avec Escape
  else if (isVisible.value && e.key === 'Escape') {
    e.preventDefault();
    toggleBossMode();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.grid-container {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f3f2f1;
}

/* Force text selection cursor to look like Excel */
.cursor-cell {
  cursor: cell;
}

/* Headers style adjustment */
th {
  position: sticky;
  top: 0;
  z-index: 20;
}

td:first-child {
  position: sticky;
  left: 0;
  z-index: 10;
}
</style>
