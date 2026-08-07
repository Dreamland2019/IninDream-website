import os
from PIL import Image

# 原图文件夹（需要提前准备好）
INPUT_FOLDER = './avatars'
# 缩略图输出文件夹
OUTPUT_FOLDER = './avatars_thumb2'


def generate_thumbs():
    if not os.path.exists(INPUT_FOLDER):
        print(f"❌ 找不到原图文件夹: {INPUT_FOLDER}")
        return

    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
        print(f"✅ 已创建缩略图文件夹: {OUTPUT_FOLDER}")

    files = os.listdir(INPUT_FOLDER)
    count = 0
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg')):
            input_path = os.path.join(INPUT_FOLDER, file)
            output_path = os.path.join(OUTPUT_FOLDER, file)

            try:
                # 打开图片
                with Image.open(input_path) as img:
                    # 生成缩略图，限制最长边为 80px，比例自动保持
                    img.thumbnail((120, 120))
                    # 保存，质量压缩到 70%，大幅缩小体积
                    img.save(output_path, optimize=True, quality=70)
                    count += 1
                    print(f"✅ 处理成功: {file}")
            except Exception as e:
                print(f"❌ 处理失败 {file}: {e}")

    print(f"\n🎉 处理完成！共生成 {count} 张缩略图。")
    print(f"📁 请将新文件夹 '{OUTPUT_FOLDER}' 上传到你的 GitHub 仓库中。")


if __name__ == '__main__':
    generate_thumbs()