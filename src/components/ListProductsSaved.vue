<script setup lang="ts">
import { ref, onMounted } from "vue";

const keys = ref<string[]>([]);

onMounted(() => {
  const raw = localStorage.getItem("data");
  if (raw) {
    const data = JSON.parse(raw);
    keys.value = Object.keys(data);
  }
});

function setGuia(key: string) {
  const input = document.getElementById("guia") as HTMLInputElement | null;
  if (input) {
    input.value = key;
  }
  localStorage.setItem("guiaActiva", key);
}

function deleteGuia(key: string) {
  const raw = localStorage.getItem("data");
  if (!raw) return;

  const data = JSON.parse(raw);
  delete data[key];
  localStorage.setItem("data", JSON.stringify(data));

  keys.value = Object.keys(data); // refresca la lista
}
</script>

<template>
  <div>
    <h2 class="text-2xl">Lista de Guías</h2>

    <div v-if="keys.length === 0">
      <p class="text-gray-500">No hay guías guardadas.</p>
    </div>

    <ul v-else>
      <li v-for="key in keys" :key="key" class="flex justify-between items-center  py-2">
        <!-- enlace de la guía -->
        <a :href="`/new-guia/`" class="text-[#9a9a9a] font-semibold" @click="setGuia(key)">
          {{ key }}
        </a>

        <!-- botón eliminar -->
        <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" type="button" @click="deleteGuia(key)">
          Eliminar
        </button>
      </li>
    </ul>
  </div>
</template>
