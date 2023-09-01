import math

import numpy as np
import scipy.ndimage


class ScanData:
    def __init__(self, data: np.ndarray):
        self.real = np.real(data)
        self.imag = np.imag(data)
        self.zoom_scale_factor = 1

    def down_sample(self, remaining_pixels: int = 150000):
        scale = get_zoom_scale_factor(self.real.shape, remaining_pixels)

        self.real = scipy.ndimage.zoom(self.real, scale)
        self.imag = scipy.ndimage.zoom(self.imag, scale)
        self.zoom_scale_factor = scale

    def to_dict(self):
        return self.__dict__()

    def __dict__(self):
        return {
            'real': self.real.tolist(),
            'imaginary': self.imag.tolist(),
        }


def get_zoom_scale_factor(shape, wanted_number_of_pixels):
    current_pixel_count = shape[0] * shape[1]
    if current_pixel_count < wanted_number_of_pixels:
        return 1  # We only want to make the image smaller

    return math.sqrt(current_pixel_count * wanted_number_of_pixels) / current_pixel_count
