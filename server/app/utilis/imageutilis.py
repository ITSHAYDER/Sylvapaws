import base64


def convert_img(img):
    image_base64 = None
    if img:
        try:
            with open(img, 'rb') as image_file:
                image_base64 = base64.b64encode(image_file.read()).decode('utf-8')
                
        except FileNotFoundError:
            image_base64 = None  
        return image_base64
