from typing import Union
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from dataset import DatasetMaker
import asyncio
import time
# %%
import configparser
# 创建 ConfigParser 对象
config = configparser.ConfigParser()
# 读取配置文件
config.read('config.ini')
dataset_maker = DatasetMaker(config["default"]["dataset_root"])

# %%
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.post("/uploadfile")
async def create_upload_file(name: str = Form(...), files: List[UploadFile] = File(...)):
    print(files)
    print(name)

    s_time = time.perf_counter()
    dataset_maker.create_directories(name)
    await dataset_maker.save_images(name, files)
    e_time = time.perf_counter()

    return {"status": "ok", "time": e_time-s_time}
