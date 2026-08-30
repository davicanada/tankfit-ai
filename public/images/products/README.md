# Product Images

Place the 13 generated WebP catalog images in this directory using the exact filenames from `docs/product-image-prompts.md`.

Before adding an image:

- Confirm that it contains no real logo, certification mark, watermark, or readable generated text.
- Crop it to a square composition without cutting off the product.
- Prefer 1600 × 1600 source images and optimize the final WebP without visible artifacts.
- Confirm that the product is visibly fictional and does not copy recognizable commercial hardware.

The application will render these local assets with `next/image`; product names and accessible descriptions come from the catalog rather than text embedded in the image.
