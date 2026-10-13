// Mapa de SP: fase 1 (UBSs da GeoSampa, busca e filtro por esfera)
const ARQUIVO = 'data/ubs.geojson';
const SP = [-23.5505, -46.6333];

// Os dados da GeoSampa vêm em UTM (SIRGAS 2000, zona 23S). O Leaflet usa latitude/longitude.
proj4.defs('EPSG:31983', '+proj=utm +zone=23 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
const utmParaLatLng = (x, y) => {
  const [lng, lat] = proj4('EPSG:31983', 'WGS84', [x, y]);
  return [lat, lng];
};

const mapa = L.map('mapa').setView(SP, 11);
// Mapa base do OpenStreetMap (não precisa de chave). No tema escuro, o CSS escurece os blocos do mapa.
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19
}).addTo(mapa);

const el = {
  busca: document.getElementById('busca'),
  esfera: document.getElementById('esfera'),
  statUbs: document.getElementById('stat-ubs'),
  legenda: document.getElementById('stat-legenda'),
  camadaUbs: document.getElementById('camada-ubs'),
  aviso: document.getElementById('aviso'),
  tema: document.getElementById('tema')
};

let unidades = [];                       // lista já convertida: { nome, endereco, bairro, cep, telefone, esfera, latlng }
const camadaUbs = L.layerGroup().addTo(mapa);

const normalizar = (t) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const corUbs = () => getComputedStyle(document.documentElement).getPropertyValue('--ubs').trim();
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function desenhar(lista) {
  camadaUbs.clearLayers();
  lista.forEach((u) => {
    const marcador = L.circleMarker(u.latlng, {
      radius: 7, color: '#fff', weight: 2, fillColor: corUbs(), fillOpacity: 0.95
    });
    marcador.bindPopup(
      `<b>${esc(u.nome)}</b><br>${esc(u.endereco)}<br>` +
      `<small>${esc(u.bairro)} · CEP ${esc(u.cep)}</small><br>` +
      `<small>${esc(u.esfera)}${u.telefone ? ' · Tel. ' + esc(u.telefone) : ''}</small>`
    );
    marcador.addTo(camadaUbs);
  });
  el.statUbs.textContent = lista.length;
  el.legenda.textContent = lista.length === 1 ? 'unidade de saúde' : 'unidades de saúde';
}

function filtrar(ajustarZoom = true) {
  const termo = normalizar(el.busca.value.trim());
  const esfera = el.esfera.value;
  const lista = unidades.filter((u) =>
    (!esfera || u.esfera === esfera) &&
    (!termo || normalizar(`${u.nome} ${u.bairro} ${u.endereco}`).includes(termo))
  );
  desenhar(lista);
  if (ajustarZoom && lista.length) {
    mapa.fitBounds(L.latLngBounds(lista.map((u) => u.latlng)), { padding: [60, 60], maxZoom: 15 });
  }
}

async function carregar() {
  try {
    const resp = await fetch(ARQUIVO);
    if (!resp.ok) throw new Error(resp.status);
    const dados = await resp.json();
    unidades = dados.features
      .filter((f) => f.geometry && f.geometry.type === 'Point')
      .map((f) => {
        const p = f.properties;
        const [x, y] = f.geometry.coordinates;
        return {
          nome: p.nm_equipamento,
          endereco: p.tx_endereco_equipamento,
          bairro: p.nm_bairro_equipamento,
          cep: p.cd_cep_equipamento,
          telefone: p.tx_numero_telefone,
          esfera: p.nm_esfera_administrativa_equipamento,
          latlng: utmParaLatLng(x, y)
        };
      });
    [...new Set(unidades.map((u) => u.esfera))].sort()
      .forEach((e) => el.esfera.add(new Option(e, e)));
    filtrar();
  } catch (e) {
    el.aviso.hidden = false;
    el.aviso.textContent = `Não consegui carregar ${ARQUIVO}. Confira o nome do arquivo na pasta data e abra o projeto por um servidor local (extensão Live Server do VS Code), não com dois cliques no arquivo.`;
    console.error(e);
  }
}

el.busca.addEventListener('input', () => filtrar());
el.esfera.addEventListener('change', () => filtrar());
el.camadaUbs.addEventListener('change', () => {
  el.camadaUbs.checked ? camadaUbs.addTo(mapa) : mapa.removeLayer(camadaUbs);
});

el.tema.addEventListener('click', () => {
  const escuro = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = escuro ? 'dark' : 'light';
  el.tema.textContent = escuro ? 'Tema claro' : 'Tema escuro';
  filtrar(false);
});

carregar();
