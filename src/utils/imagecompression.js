// Faz o Resize e compressão das imagens, devolvendo um URL de data base64. Assim as banners ficam dentro do limite do firestore.

export function compressImage(file, maxDimension = 600, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read file.'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('Could not load image.'));
            img.onload = () => {
                let { width, height } = img;

                if (width > height && width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');

                //so para os pngs ficarem com fundo branco e nao preto

                ctx.fillStyle = '#f0f0f0';  //let the FOFOFOFO saga begiiiiin
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

// como o limite do firestore é 1mb, este limite deixa espaço suficiente para o input dos outros campos (incluindo descrições sem limite de tamanho).
export const MAX_IMAGE_DATA_URL_LENGTH = 700_000;