import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import fs from'node:fs';import{Chart}from'../src/Chart.jsx';import{posterSvg}from'../src/export.mjs';
const rows=JSON.parse(fs.readFileSync('data/processed/seoul_pet_care.json')),geo=JSON.parse(fs.readFileSync('data/processed/seoul_districts.geojson'));
const svg=renderToStaticMarkup(<Chart rows={rows} geo={geo}/>).replace('<svg ','<svg x="90" y="400" width="1620" height="1620" ');
globalThis.document={querySelector:()=>({cloneNode:()=>({setAttribute:()=>{}})})};globalThis.XMLSerializer=class{serializeToString(){return svg;}};
fs.mkdirSync('exports',{recursive:true});fs.writeFileSync('exports/SEOUL-PET-CARE-CITY.svg',posterSvg());console.log('Poster SVG generated from same Chart component.');
