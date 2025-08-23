<template>
  <div v-if="Object.keys(grouped).length > 0">
    <div v-for="(products, tipo) in grouped" :key="tipo" class="mb-6">
      <h2 class="text-2xl">{{ tipo }}</h2>
      <br />
      <div class="bg-gray-900 rounded-md py-4">
        <!-- Producto -->
        <div
          v-for="(item, i) in products"
          :key="i"
          :data-id="item.producto + ' ' + item.tipo"
          class="grid grid-cols-[min-content_1fr_max-content_max-content] [&>*]:p-3 items-center"
        >
          <div>
            <input type="checkbox" v-model="item.done" class="w-4 aspect-square" name="active" />
          </div>
          <div class="flex flex-col gap-1.5">
            <span>{{ item.producto.toUpperCase() }}</span>
            <div class="flex gap-6">
              <span>{{ item.bultos }}</span>
              <span>{{ item.calc.total }}</span>
            </div>
          </div>
          <button class="popup-btn" @click.stop="togglePopup(item, $event)">
            <slot name="svgContent"></slot>
          </button>
        </div>
        <br />
        <hr />
        <div class="grid grid-cols-[min-content_1fr_max-content_max-content] [&>*]:p-3">
          <span class="col-start-2">Items : {{ items(tipo) }} </span>
          <span>{{ bultos(tipo) }}</span>
          <span>{{ total(tipo) }}</span>
        </div>
      </div>
    </div>
    <br />
    <div class="flex gap-4 justify-between text-2xl">
      <span>Items: {{ itemsGenerales }}</span>
      <span>Total: {{ totalGeneral }}</span>
      </div>
    <br />
  </div>

  <div v-else>No hay productos</div>

  <!-- Popup -->
  <div
    v-if="popupItem"
    class="absolute bg-black rounded shadow flex flex-col w-max"
    :style="{
      position: 'fixed',
      top: popupPos.y + 'px',
      left: popupPos.x + 'px',
      transform: 'translate(-70%, 50%)',
    }"
  >
    <button class="px-4 py-2 text-left" @click="editItem(popupItem)">✏️ Editar</button>
    <button class="px-4 py-2 text-left" @click="deleteItem(popupItem)">🗑️ Eliminar</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const data = ref<Product[]>([]);

const renderData = () => {
  const guiaCodigo = localStorage.getItem("guiaActiva");
  const raw = localStorage.getItem("data");

  if (raw && guiaCodigo) {
    const parsed = JSON.parse(raw) as Data;
    data.value = parsed[guiaCodigo] || [];
  } else {
    data.value = [];
  }
};

// cargar desde localStorage
onMounted(() => {
  renderData();

  window.addEventListener("register-product", renderData);

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".popup-btn") && !target.closest(".popup-menu")) {
      popupItem.value = null;
    }
  });
});

// agrupamos por tipo (paq x 4, paq x 2, etc.)
const grouped = computed(() => {
  const result: Data = {};
  data.value.forEach((p) => {
    if (!result[p.tipo]) result[p.tipo] = [];
    result[p.tipo].push(p);
  });
  return result;
});

const total = computed(() => {
  return (tipo: string) => {
    const filtrados = grouped.value[tipo] ?? [];
    const total = filtrados.reduce((sum, prod) => sum + prod.calc.total, 0);
    return total;
  };
});
const items = computed(() => {
  return (tipo: string) => {
    const filtrados = grouped.value[tipo] ?? [];
    const total = filtrados.reduce((sum, prod) => sum + prod.items, 0);
    return total;
  };
});

const bultos = computed(() => {
  return (tipo: string) => {
    const filtrados = grouped.value[tipo] ?? [];

    const { paq, uni } = filtrados.reduce(
      (acc, prod) => {
        acc.paq += prod.calc.paq;
        acc.uni += prod.calc.uni;
        return acc;
      },
      { paq: 0, uni: 0 }
    );

    const parts: string[] = [];
    if (paq > 0) parts.push(`${paq} ${tipo}`);
    if (uni > 0) parts.push(`${uni} uni`);

    return parts.join(" + ");
  };
});

// Genertales resultados

const itemsGenerales = computed(() => {
  return data.value.reduce((sum, prod) => sum + prod.items, 0);
});
const totalGeneral = computed(() => {
  return data.value.reduce((sum, prod) => sum + prod.calc.total, 0);
});

const popupItem = ref<Product | null>(null);
const popupPos = ref<{ x: number; y: number }>({ x: 0, y: 0 });

function togglePopup(item: Product, e: MouseEvent) {
  if (popupItem.value === item) {
    popupItem.value = null; // cerrar si está abierto
    return;
  }
  const btn = e.currentTarget as HTMLElement;
  const rect = btn.getBoundingClientRect();

  popupItem.value = item;
  // centro horizontal del botón y su borde superior
  popupPos.value = {
    x: rect.left + rect.width / 2,
    y: rect.top,
  };
}

function deleteItem(item: Product) {
  alert("Eliminar: " + item.producto);
  popupItem.value = null;
}

function editItem(item: Product) {
  // Abrir el dialog
  const dialog = document.getElementById("formDialog") as HTMLDialogElement;
  dialog.showModal();

  // Asignar valores a los inputs
  (document.getElementById("producto") as HTMLInputElement).value = item.producto;
  (document.getElementById("paq") as HTMLInputElement).value = String(item.paquete);
  (document.getElementById("cantidad-area") as HTMLTextAreaElement).value = item.cantidades;

  // Cargar tipo
  const select = document.getElementById("tipoSelect") as HTMLSelectElement;
  const input = document.getElementById("tipoInput") as HTMLInputElement;

  // Revisar si el tipo existe en el select
  const option = Array.from(select.options).find((opt) => opt.text === item.tipo);
  if (option) {
    // activar modo select
    document.querySelector<HTMLInputElement>('input[value="select"]')!.checked = true;
    select.style.display = "block";
    select.required = true;

    input.style.display = "none";
    input.required = false;

    select.value = option.value;
  } else {
    // activar modo custom
    document.querySelector<HTMLInputElement>('input[value="custom"]')!.checked = true;
    input.style.display = "block";
    input.required = true;

    select.style.display = "none";
    select.required = false;

    input.value = item.tipo;
  }

  // (Opcional) si guardaste color en Product, asignarlo aquí
  // (document.getElementById("color") as HTMLInputElement).value = item.color ?? "#ffffff";

  popupItem.value = null; // cerrar popup
}
</script>
