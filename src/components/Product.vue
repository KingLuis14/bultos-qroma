<template>
  <div v-if="Object.keys(grouped).length > 0">
    <div v-for="(products, tipo) in grouped" :key="tipo" class="mb-5">
      <section>
        <header class="acordeon-header flex justify-between items-baseline">
          <div>
            <h2 class="text-2xl font-semibold first-letter:uppercase">{{ tipo }}</h2>
            <div class="flex gap-2 text-[#cbcbcb] mt-2.5 font-medium">
              <span class="item-result cyan"> {{ items(tipo) }} items </span>
              <span class="item-result green">{{ bultos(tipo) }}</span>
              <span class="item-result yellow">{{ total(tipo) }}</span>
            </div>
          </div>
          <button class="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="acordeon-icono pointer-events-none"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" />
            </svg>
          </button>
        </header>
        
        <div class="bg-[#1a1f25] rounded-xl mt-6" >
          <div class="acordeon-contenido isOpen">
            <div class="overflow-hidden">
              <div class="flex flex-col">
                <!-- Producto -->
                <div
                  v-for="(item, i) in products"
                  :key="i"
                  :data-id="item.producto + ' ' + item.tipo"
                  class="  grid grid-cols-[min-content_1fr_max-content] gap-4 items-center px-2 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[#262b34]"
                >
                  <div class="pr-0">
                    <input
                      type="checkbox"
                      v-model="item.done"
                      @change="toggleDone(item)"
                      class="w-5 aspect-square accent-green-400"
                    />
                  </div>
                  <div class="flex flex-col gap-1.5 font-medium  py-4">
                    <span :class="{ 'line-through': item.done }" class="uppercase">
                      {{ item.producto }}
                    </span>
                    <div class="flex gap-2 text-[#9a9a9a]">
                      <span>{{ item.items }} items</span>
                      <span>• {{ item.bultos }}</span>
                      <span>• {{ item.calc.total }}</span>
                    </div>
                  </div>
                  <button class="popup-btn " @click.stop="togglePopup(item, $event)">
                    <slot name="svgContent"></slot>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
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

<style scoped>
.acordeon-contenido {
  display: grid;
  will-change: grid-template-rows;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s ease-out;

  &.isOpen {
    grid-template-rows: 1fr;
  }
}

.acordeon-icono {
  transform: rotate(0deg);
  transition: transform 0.2s linear;

  &.rotate {
    transform: rotate(180deg);
  }
}
</style>

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

onMounted(() => {
  renderData();

  window.addEventListener("register-product", renderData);

  document.body.addEventListener("click", (e) => {
    const el = e.target as HTMLElement | null;
    if (!el) return;

    // cerrar popup si clic fuera
    if (!el.closest(".popup-btn, .popup-menu")) {
      popupItem.value = null;
    }

    // acordeón
    const header = el.closest<HTMLElement>(".acordeon-header");
    if (header) {
      const contenido = header.nextElementSibling!.querySelector(".acordeon-contenido");
      contenido?.classList.toggle("isOpen");
      header.querySelector(".acordeon-icono")?.classList.toggle("rotate");
    }
  });
});

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
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
  const guiaCodigo = localStorage.getItem("guiaActiva");
  if (!guiaCodigo) return;

  const raw = localStorage.getItem("data");
  const data: Data = raw ? JSON.parse(raw) : {};

  const products = data[guiaCodigo] ?? [];

  // Filtrar eliminando solo el producto que coincida en nombre y tipo
  const newProducts = products.filter((p) => !(p.producto === item.producto && p.tipo === item.tipo));

  const newData: Data = {
    ...data,
    [guiaCodigo]: newProducts,
  };

  localStorage.setItem("data", JSON.stringify(newData));
  window.dispatchEvent(new Event("register-product"));

  popupItem.value = null; // cerrar popup
}

function editItem(item: Product) {
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

  popupItem.value = null; // cerrar popup
}

function toggleDone(item: Product) {
  const guiaCodigo = localStorage.getItem("guiaActiva");
  if (!guiaCodigo) return;

  const raw = localStorage.getItem("data");
  const data: Data = raw ? JSON.parse(raw) : {};

  const products = data[guiaCodigo] ?? [];

  // buscar el producto y actualizar el campo done
  const updated = products.map((p) =>
    p.producto === item.producto && p.tipo === item.tipo ? { ...p, done: item.done } : p
  );

  const newData: Data = { ...data, [guiaCodigo]: updated };
  localStorage.setItem("data", JSON.stringify(newData));
}
</script>
