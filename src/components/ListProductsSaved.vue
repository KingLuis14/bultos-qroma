<script setup lang="ts">
import { navigate } from "astro:transitions/client";
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
    input.value = key; // 👈 mete el key directamente en el input de Astro
  }
  localStorage.setItem("guiaActiva", key);
  //   navigate('/new-guia/')
}
</script>

<template>
  <div>
    <h2 class="text-2xl">Lista de Guías</h2>

    <div v-if="keys.length === 0">
      <p class="text-gray-500">No hay guías guardadas.</p>
    </div>

    <ul v-else>
      <li v-for="key in keys" :key="key">
        <a :href="`/new-guia/`" class="text-blue-600 hover:underline p-3 block" @click="setGuia(key)">
          {{ key }}
        </a>
      </li>
    </ul>
  </div>
</template>
