
import fs from 'fs';
import path from 'path';

const assetsDir = 'public/assets';
const outputJson = 'src/assets.json';

const assetCategories = {
    boss: 'b',
    cutin: 'c',
    enemy: 'e',
    player: 'f',
    bg: 'bg',
    bgm: 'bgm'
};

const result = {};

for (const category in assetCategories) {
    const dirPath = path.join(assetsDir, assetCategories[category]);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath).map(file => `assets/${assetCategories[category]}/${file}`);
        result[category] = files;
    } else {
        result[category] = [];
    }
}

fs.writeFileSync(outputJson, JSON.stringify(result, null, 2));

console.log(`Asset list generated at ${outputJson}`);
