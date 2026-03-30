export const uploadImage = async (file: File): Promise<string> => {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', 'Productos');
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDNAME}/image/upload`,
    { method: 'POST', body: data }
  );
  if (!res.ok) throw new Error('Error al subir imagen a Cloudinary');
  const json = await res.json();
  return json.secure_url as string;
};
