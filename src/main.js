import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

const SPREADSHEET_ID = '1HxBvR2XvOLClJoe83hVJ1_Hm3E6K-JYcP_kBKAtfZwE';
const SHEET_ID = '1734591452';

async function fetchSpreadsheetData() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_ID}`;
        const response = await fetch(url);
        const csvText = await response.text();
        
        const rows = csvText.split('\n').map(row => {
            const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            return matches ? matches.map(val => val.replace(/^"|"$/g, '').trim()) : [];
        });
        
        rows.shift();
        
        const table = [];
        rows.forEach((row, index) => {
            if (row.length >= 6) {
                const tableX = (index % 20) + 1; 
                const tableY = Math.floor(index / 20) + 1;  
                
                
                const gridX = (index % 5) + 1;  
                const gridY = Math.floor((index % 20) / 5) + 1;  
                const gridZ = Math.floor(index / 20) + 1;  
                
                const netWorth = parseFloat(row[5].replace(/[^0-9.]/g, ''));
                
                table.push(
                    row[0],               
                    row[1],               
                    `${row[2]} years | ${row[3]} | ${row[4]}`, 
                    tableX,
                    tableY,
                    gridX,
                    gridY,
                    gridZ,
                    netWorth             
                );
            }
        });
        
        return table;
    } catch (error) {
        console.error('Error fetching spreadsheet data:', error);
        return [];
    }
}

// Function to get proxied image URL
function getProxiedImageUrl(url) {
    if (!url) return null;
    
    // If it's a relative URL, construct the full URL
    if (!url.toLowerCase().startsWith('http')) {
        url = `https://static.kasatria.com/pivot-img/photo/${url}`;
    }
    
    // Use a reliable image proxy service
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
}

let camera, scene, renderer;
let controls;

const objects = [];
const targets = { table: [], sphere: [], helix: [], grid: [] };

async function init() {
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 4000;
    camera.position.y = 1000;
    camera.position.x = 1000;

    scene = new THREE.Scene();

    // Fetch and process the data
    const table = await fetchSpreadsheetData();
    
    if (table.length === 0) {
        console.error('No data received from spreadsheet');
        return;
    }

    // Create elements
    for (let i = 0; i < table.length; i += 9) { // Note: now 9 values per item (including net worth)
        const element = document.createElement('div');
        element.className = 'element';
        
        // Set background color based on net worth
        const netWorth = table[i + 8];
        let backgroundColor;
        if (netWorth < 100000) {
            backgroundColor = 'rgba(180,0,0,0.85)'; // Darker, more saturated red
        } else if (netWorth < 200000) {
            backgroundColor = 'rgba(205,120,0,0.85)'; // Darker, more saturated orange
        } else {
            backgroundColor = 'rgba(0,128,128,0.85)'; // Teal/Tosca color
        }
        element.style.backgroundColor = backgroundColor;

        // Add photo
        const photo = document.createElement('img');
        photo.className = 'photo';
        const imageUrl = getProxiedImageUrl(table[i + 1]);
        if (imageUrl) {
            photo.crossOrigin = "anonymous";  
            photo.src = imageUrl;
            photo.onerror = (e) => {
                console.error('Failed to load image:', imageUrl);
                // Create fallback with first letter of name
                const initial = table[i].charAt(0).toUpperCase();
                e.target.style.display = 'flex';
                e.target.style.alignItems = 'center';
                e.target.style.justifyContent = 'center';
                e.target.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                e.target.style.color = 'white';
                e.target.style.fontSize = '36px';
                e.target.style.fontWeight = 'bold';
                e.target.textContent = initial;
            };
        }
        photo.style.width = '120px';
        photo.style.height = '120px';
        photo.style.objectFit = 'cover';
        photo.style.borderRadius = '60px';
        photo.style.marginBottom = '10px';
        photo.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        photo.style.transition = 'transform 0.2s ease-in-out';
        
        photo.onmouseover = () => photo.style.transform = 'scale(1.1)';
        photo.onmouseout = () => photo.style.transform = 'scale(1)';
        
        element.appendChild(photo);

        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = table[i];
        element.appendChild(name);

        const details = document.createElement('div');
        details.className = 'details';
        details.innerHTML = table[i + 2];
        element.appendChild(details);

        const objectCSS = new CSS3DObject(element);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        scene.add(objectCSS);

        objects.push(objectCSS);

        // table layout (20x10)
        const object = new THREE.Object3D();
        object.position.x = (table[i + 3] * 180) - 1800; // 20 columns
        object.position.y = -(table[i + 4] * 220) + 1100; // 10 rows

        targets.table.push(object);
    }

    // grid layout (5x4x10)
    for (let i = 0; i < objects.length; i++) {
        const idx = i * 9; // Adjust for 9 values per item
        const object = new THREE.Object3D();
        
        object.position.x = (table[idx + 5] * 400) - 1200; // gridX
        object.position.y = -(table[idx + 6] * 400) + 800; // gridY
        object.position.z = -(table[idx + 7] * 400) + 2000; // gridZ
        
        targets.grid.push(object);
    }

    // sphere
    const vector = new THREE.Vector3();
    for (let i = 0, l = objects.length; i < l; i++) {
        const phi = Math.acos(-1 + (2 * i) / l);
        const theta = Math.sqrt(l * Math.PI) * phi;
        const object = new THREE.Object3D();
        object.position.setFromSphericalCoords(1000, phi, theta);
        vector.copy(object.position).multiplyScalar(2);
        object.lookAt(vector);
        targets.sphere.push(object);
    }

    // helix
    for (let i = 0, l = objects.length; i < l; i++) {
        const theta = i * 0.22234 + Math.PI;   // Increased by 5% from 0.21175 to 0.22234
        const y = -(i * 10.164) + 450;         // Increased by 5% from 9.68 to 10.164
        const object = new THREE.Object3D();
        object.position.setFromCylindricalCoords(900, theta, y);
        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;
        object.lookAt(vector);
        targets.helix.push(object);
    }

    renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    controls = new TrackballControls(camera, renderer.domElement);
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

    const buttonTable = document.getElementById('table');
    buttonTable.addEventListener('click', () => {
        transform(targets.table, 2000);
    });

    const buttonSphere = document.getElementById('sphere');
    buttonSphere.addEventListener('click', () => {
        transform(targets.sphere, 2000);
    });

    const buttonHelix = document.getElementById('helix');
    buttonHelix.addEventListener('click', () => {
        transform(targets.helix, 2000);
    });

    const buttonGrid = document.getElementById('grid');
    buttonGrid.addEventListener('click', () => {
        transform(targets.grid, 2000);
    });

    transform(targets.table, 2000);

    window.addEventListener('resize', onWindowResize);
}

function transform(targets, duration) {
    TWEEN.removeAll();

    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = targets[i];

        if (!object || !target) continue;  // Skip invalid objects

        new TWEEN.Tween(object.position)
            .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(object.rotation)
            .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }

    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(() => {
            if (renderer && scene && camera) {
                render();
            }
        })
        .start();
}

function animate() {
    requestAnimationFrame(animate);
    if (typeof TWEEN !== 'undefined') {
        TWEEN.update();
    }
    if (controls) {
        controls.update();
    }
    render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function render() {
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Start the application
init();
animate();
