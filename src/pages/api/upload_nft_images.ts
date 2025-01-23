import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/utils/server/supabase-admin';
import pinataSDK from "@pinata/sdk";
import { PINATA_API_KEY, PINATA_API_SECRET, PINATA_API_JWT } from "@/utils/server/consts";
import fs from 'fs';

type ResponseData = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);
  const { files, wallet_address, nft_name } = req.body;

  let meta_data: any = {};

  if (files.length == 1) {
    try {
      const extension = getImageExtension(files[0]);
      const tempFilePath = `./temp/${wallet_address}.${extension}`;
      await fs.writeFileSync(tempFilePath, files[0].replace(/^data:image\/\w+;base64,/, ""), 'base64');
      const fileStream = fs.createReadStream(tempFilePath);
      const result = await pinata.pinFileToIPFS(fileStream, {
        pinataMetadata: {
          name: `${nft_name}.png`, // Metadata name for the file
        },
      });
      meta_data = {
        name: nft_name,
        attributes: [],
        image: `ipfs://${result.IpfsHash}`
      };
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      console.log(e);
    }
  } else {
    const uploadedImages = [];
    for (let k = 0; k < files.length; k++) {
      const file = files[k];
      const extension = getImageExtension(file);
      const tempFilePath = `./temp/${wallet_address}.${extension}`;
      await fs.writeFileSync(tempFilePath, file.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      const fileStream = fs.createReadStream(tempFilePath);
      const name = `${nft_name}-${k + 1}.png`;
      const result = await pinata.pinFileToIPFS(fileStream, {
        pinataMetadata: {
          name: `${nft_name}-${k + 1}.png`, // Metadata name for the file
        },
      });
      uploadedImages.push({
        view: name,
        image: `ipfs://${result.IpfsHash}`
      })
      fs.unlinkSync(tempFilePath);
    }
    meta_data = {
      name: nft_name,
      images: uploadedImages,
      primiary_image: uploadedImages[0]['image']
    }
  }

  const { data, error } = await supabaseAdmin
    .from('data')
    .insert([{ meta_data, wallet_address }]);
  console.log(error);

  res.status(200).json({ message: 'Hello from Next.js!' })
}

function getImageExtension(base64String: string) {
  // Regular expression to extract the MIME type
  const mimeMatch = base64String.match(/^data:image\/(\w+);base64,/);

  if (mimeMatch && mimeMatch[1]) {
    return mimeMatch[1]; // Extract the extension (e.g., png, jpeg)
  } else {
    throw new Error('Invalid Base64 string or missing MIME type.');
  }
}