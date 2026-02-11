const buscar = document.querySelector(".buscar");
const containerCards = document.querySelector(".container-cards");
const cargarMas = document.querySelector(".cargar-mas");

const URL_POKEMON = "https://pokeapi.co/api/v2/pokemon/";

// Variables globales para controlar el estado
let todosLosPokemon = []; // Almacena todos los Pokémon descargados
let pokemonFiltrados = []; // Pokémon filtrados por búsqueda
let pokemonMostrados = 0; // Cantidad de Pokémon actualmente mostrados
const POKEMON_POR_PAGINA = 20;
const TOTAL_POKEMON = 1025; // Primera generación

// Función que obtiene los Pokémon de la API
async function obtenerPokemons() {
    try {
        // Muestra un mensaje de carga
        containerCards.innerHTML = '<div class="col-12 text-center"><h3 class="text-white">Cargando Pokémon...</h3></div>';

        // Obtener los primeros 151 Pokémon (primera generación)
        const response = await fetch(`${URL_POKEMON}?limit=${TOTAL_POKEMON}`);
        const data = await response.json();

        // Obtener detalles de cada Pokémon
        const promesas = data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            const detalles = await res.json();

            return {
                id: String(detalles.id).padStart(3, '0'),
                nombre: detalles.name.charAt(0).toUpperCase() + detalles.name.slice(1),
                img: detalles.sprites.other['official-artwork'].front_default || detalles.sprites.front_default,
                sprite: detalles.sprites.front_default,
                tipo1: detalles.types[0]?.type.name.charAt(0).toUpperCase() + detalles.types[0]?.type.name.slice(1) || 'Unknown',
                tipo2: detalles.types[1]?.type.name.charAt(0).toUpperCase() + detalles.types[1]?.type.name.slice(1) || '',
                peso: (detalles.weight / 10).toFixed(1), // API returns weight in hectograms
                altura: (detalles.height / 10).toFixed(1), // API returns height in decimeters
                habilidades: detalles.abilities.map(a => a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1)).join(', ')
            };
        });

        todosLosPokemon = await Promise.all(promesas);
        pokemonFiltrados = [...todosLosPokemon]; // Inicialmente, todos están filtrados

        // Limpiar el contenedor y mostrar los primeros 20
        containerCards.innerHTML = '';
        cargarMasPokemon();

    } catch (error) {
        console.error('Error al obtener los Pokémon:', error);
        containerCards.innerHTML = '<div class="col-12 text-center"><h3 class="text-danger">Error al cargar los Pokémon</h3></div>';
    }
}

// Función que carga los siguientes 20 Pokémon
function cargarMasPokemon() {
    const inicio = pokemonMostrados;
    const fin = Math.min(pokemonMostrados + POKEMON_POR_PAGINA, pokemonFiltrados.length);

    for (let i = inicio; i < fin; i++) {
        agregarCarta(pokemonFiltrados[i]);
    }

    pokemonMostrados = fin;

    // Ocultar el botón si ya no hay más Pokémon para mostrar
    if (pokemonMostrados >= pokemonFiltrados.length) {
        cargarMas.style.display = 'none';
    } else {
        cargarMas.style.display = 'block';
    }
}

// Función que devuelve el HTML de la carta
function crearCartaPokemon(pokemon) {
    // Mostrar el segundo tipo solo si existe
    const tipo2HTML = pokemon.tipo2
        ? `<span class="badge ${devolverColor(pokemon.tipo2)} w-50 text-center ms-1">${pokemon.tipo2}</span>`
        : '';

    const tipoWidth = pokemon.tipo2 ? 'w-50' : 'w-100';

    return `
        <div class="col">
            <div class="card bg-dark border border-2 border-danger" data-pokemon-id="${pokemon.id}">
                <div class="card-header p-2">
                    <span class="badge w-100 mb-2">#${pokemon.id}</span>
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="badge ${devolverColor(pokemon.tipo1)} ${tipoWidth} text-center">${pokemon.tipo1}</span>
                        ${tipo2HTML}
                    </div>
                </div>
                <img src="${pokemon.img}" class="card-img card-img-top p-1" alt="${pokemon.nombre}">
                <div class="card-body">
                    <h5 class="card-title text-white text-center m-0">${pokemon.nombre}</h5>
                </div>
            </div>
        </div>
    `;
}

// Función que inserta la carta en el contenedor
function agregarCarta(pokemon) {
    containerCards.innerHTML += crearCartaPokemon(pokemon);
}

// Función que filtra los Pokémon según la búsqueda
function filtrarPokemon(textoBusqueda) {
    const textoLower = textoBusqueda.toLowerCase().trim();

    if (textoLower === '') {
        // Si no hay búsqueda, mostrar todos
        pokemonFiltrados = [...todosLosPokemon];
    } else {
        // Filtrar por nombre o ID
        pokemonFiltrados = todosLosPokemon.filter(pokemon =>
            pokemon.nombre.toLowerCase().includes(textoLower) ||
            pokemon.id.includes(textoLower)
        );
    }

    // Reiniciar la visualización
    pokemonMostrados = 0;
    containerCards.innerHTML = '';

    if (pokemonFiltrados.length === 0) {
        containerCards.innerHTML = '<div class="col-12 text-center"><h3 class="text-white">No se encontraron Pokémon</h3></div>';
        cargarMas.style.display = 'none';
    } else {
        cargarMasPokemon();
    }
}

function devolverColor(tipo) {
    switch (tipo) {
        case 'Normal':
            return 'bg-secondary';
        case 'Fire':
            return 'bg-danger';
        case 'Water':
            return 'bg-primary';
        case 'Grass':
            return 'bg-success';
        case 'Electric':
            return 'bg-warning';
        case 'Ice':
            return 'bg-info';
        case 'Fighting':
            return 'bg-danger';
        case 'Poison':
            return 'bg-purple';
        case 'Ground':
            return 'bg-brown';
        case 'Flying':
            return 'bg-info';
        case 'Psychic':
            return 'bg-pink';
        case 'Bug':
            return 'bg-success';
        case 'Rock':
            return 'bg-secondary';
        case 'Ghost':
            return 'bg-purple';
        case 'Dragon':
            return 'bg-danger';
        case 'Steel':
            return 'bg-secondary';
        case 'Fairy':
            return 'bg-pink';
    }
}

// Event Listeners
cargarMas.addEventListener('click', () => {
    cargarMasPokemon();
});

buscar.addEventListener('input', (e) => {
    filtrarPokemon(e.target.value);
});

// Pokedex overlay functionality
const pokedexOverlay = document.querySelector('.pokedex-overlay');
const mainContent = document.querySelector('.main-content');
const arrowLeft = document.querySelector('.pokedex-arrow-left');
const arrowRight = document.querySelector('.pokedex-arrow-right');

// Current state
let currentPokemon = null;
let currentModeIndex = 0;

// ===== POKEDEX MODES SYSTEM =====
// To add a new mode, simply add an object to this array with name and render function
const pokedexModes = [
    {
        name: 'Sprite',
        render: (pokemon) => `
            <img src="${pokemon.sprite}" alt="${pokemon.nombre}" class="w-100 h-100" style="object-fit: contain; padding: 10px;">
        `
    },
    {
        name: 'Stats',
        render: (pokemon) => `
            <div class="text-white p-3 h-100 d-flex flex-column justify-content-center" style="font-size: 1.2rem;">
                <div class="mb-2"><strong>Peso:</strong> ${pokemon.peso} kg</div>
                <div class="mb-2"><strong>Altura:</strong> ${pokemon.altura} m</div>
            </div>
        `
    },
    {
        name: 'Abilities',
        render: (pokemon) => `
            <div class="text-white p-3 h-100 d-flex flex-column justify-content-center" style="font-size: 1.1rem;">
                <div class="mb-2 text-center"><strong>Habilidades:</strong></div>
                <div class="text-center">${pokemon.habilidades}</div>
            </div>
        `
    },
    {
        name: 'Types',
        render: (pokemon) => {
            const tipo2HTML = pokemon.tipo2
                ? `<span class="badge ${devolverColor(pokemon.tipo2)} fs-4 px-4 py-2">${pokemon.tipo2}</span>`
                : '';

            return `
                <div class="d-flex flex-column justify-content-center align-items-center h-100 gap-3">
                    <span class="badge ${devolverColor(pokemon.tipo1)} fs-4 px-4 py-2">${pokemon.tipo1}</span>
                    ${tipo2HTML}
                </div>
            `;
        }
    }
    // EASY TO ADD MORE MODES HERE:
    // {
    //     name: 'NewMode',
    //     render: (pokemon) => `<div>Your HTML here with ${pokemon.data}</div>`
    // }
];

// Function to render the current mode
function renderCurrentMode() {
    if (!currentPokemon) return;

    const screenDiv = document.querySelector('.pokedex-main-screen');
    const currentMode = pokedexModes[currentModeIndex];
    screenDiv.innerHTML = currentMode.render(currentPokemon);
}

// Function to change mode
function changeMode(direction) {
    currentModeIndex += direction;

    // Loop around if at the edges
    if (currentModeIndex < 0) {
        currentModeIndex = pokedexModes.length - 1;
    } else if (currentModeIndex >= pokedexModes.length) {
        currentModeIndex = 0;
    }

    renderCurrentMode();
}

// Function to show pokedex
function mostrarPokedex(pokemonId) {
    // Find the pokemon data
    const pokemon = pokemonFiltrados.find(p => p.id === pokemonId);

    if (pokemon) {
        currentPokemon = pokemon;
        currentModeIndex = 0; // Reset to first mode
        renderCurrentMode();

        // Update the name screen
        const nameScreen = document.querySelector('.pokedex-name-screen');
        nameScreen.innerHTML = `
            <h3 class="text-white text-center m-0 text-uppercase fw-bold">${pokemon.nombre}</h3>
        `;
    }

    pokedexOverlay.classList.add('active');
    mainContent.classList.add('blurred');
}

// Function to hide pokedex
function ocultarPokedex() {
    pokedexOverlay.classList.remove('active');
    mainContent.classList.remove('blurred');
}

// Close pokedex when clicking on the overlay
pokedexOverlay.addEventListener('click', (e) => {
    if (e.target === pokedexOverlay || e.target.classList.contains('pokedex-container')) {
        ocultarPokedex();
    }
});

// Add click event to cards (using event delegation)
containerCards.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) {
        const pokemonId = card.dataset.pokemonId;
        mostrarPokedex(pokemonId);
    }
});

// Close pokedex with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        ocultarPokedex();
    }
    // Navigate modes with arrow keys when pokedex is open
    if (pokedexOverlay.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
            changeMode(-1);
        } else if (e.key === 'ArrowRight') {
            changeMode(1);
        }
    }
});

// Arrow button event listeners
arrowLeft.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent closing the pokedex
    changeMode(-1);
});

arrowRight.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent closing the pokedex
    changeMode(1);
});

// Inicializar al cargar la página
obtenerPokemons();
