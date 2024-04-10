import os
CARTOON_LIST = ["./developer"]
LANGUAGE_LIST = ["en","kr","jp","cn","ru"]

for path in CARTOON_LIST:
    for lang in LANGUAGE_LIST:
        sub_path = path + "/" + lang
        file_names = os.listdir(sub_path)
        i = 1
        for name in file_names:
            src = os.path.join(sub_path, name)
            if ".png" == name[-4:] or ".jpg" == name[-4:] or ".jpeg" == name[-5:]:
                if i < 10:
                    dst = '000' + str(i) + '.png'
                elif i < 100:
                    dst = '00' + str(i) + '.png'
                elif i < 1000:
                    dst = '0' + str(i) + '.png'
                else:
                    dst = str(i) + '.png'
                dst = os.path.join(sub_path, dst)
                os.rename(src, dst)
                i += 1