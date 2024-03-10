import os
import aiofiles


class DatasetMaker:

    def __init__(self, root):
        self.root = root
        self.folders = ["images", "labels"]

    def create_directories(self, name):
        """
        创建目录结构
        """
        path_of_dataset = os.path.join(self.root, name)
        os.makedirs(path_of_dataset, exist_ok=True)

        for folder in self.folders:
            dir_path = os.path.join(path_of_dataset, folder)
            os.makedirs(dir_path, exist_ok=True)
            print(f"Created directory: {dir_path}")

    async def save_images(self, name, files):
        images_path = os.path.join(self.root, name, "images")

        for no, file in enumerate(files, start=1):
            file_name = file.filename
            file_size = file.size/1024/1024

            ext = file_name.rsplit(".", 1)[-1]
            savefile_name = f"{no:05d}.{ext}"

            print(
                f"Received file: {file_name} ({savefile_name}), Size: {file_size:.2f} MB")

            file_path = os.path.join(images_path, savefile_name)
            print(f"Saving {file_path}")

            async with aiofiles.open(file_path, "wb") as f:
                await f.write(file.file.read())
