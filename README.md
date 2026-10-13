# Mapa de SP: como é viver no meu bairro?

Mapa interativo com dados abertos da cidade de São Paulo (HTML, CSS, JavaScript, Leaflet e proj4).

## Como rodar
1. Coloque o GeoJSON baixado da GeoSampa em `data/ubs.geojson`
   (camada "UBS/Posto/Centro de Saúde", baixada em GeoJSON).
2. Abra a pasta no VS Code e use a extensão **Live Server** (clique direito em `index.html` > Open with Live Server).
   Abrir o arquivo com dois cliques não funciona, porque o navegador bloqueia o `fetch` dos dados.

## Fase 1 (feita)
- Mapa base claro/escuro
- UBSs e postos de saúde com popup (nome, endereço, bairro, CEP, telefone)
- Busca por nome, bairro ou rua
- Filtro pela esfera administrativa (municipal, estadual, privado)
- Conversão de coordenadas UTM (EPSG:31983) para latitude/longitude no navegador

## Próximas fases
2. Distritos (polígonos) e ciclovias, com filtro por distrito de verdade
3. Banco SQL + API (Node/Express)
4. Painel do bairro com gráficos
5. Polimento, PT/EN e README com prints

## Dados
Fonte: GeoSampa, Prefeitura de São Paulo. A camada é atualizada anualmente; anote aqui a data do download.
