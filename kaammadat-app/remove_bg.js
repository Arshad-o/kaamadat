const Jimp = require('jimp');

async function removeBackground(filename) {
  try {
    const image = await Jimp.read(`public/${filename}`);
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      if (r > 235 && g > 235 && b > 235) {
        this.bitmap.data[idx + 3] = 0;
      }
    });
    await image.writeAsync(`public/${filename}`);
    console.log(`Done: ${filename}`);
  } catch (e) {
    console.error(`Failed: ${filename}`, e);
  }
}

async function main() {
  await removeBackground('worker_lean_pose.png');
  await removeBackground('worker_walk2.png');
}

main();
