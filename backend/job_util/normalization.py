import numpy as np


def clean_graph_data(err_fmag, err_phot, err_exit, iteration_numbers):
    # Remove iterations from start where all errors are zero
    data_starts_at = len(iteration_numbers)
    for i in range(len(iteration_numbers)):
        if err_fmag[i] == 0 and err_phot[i] == 0 and err_exit[i] == 0:
            continue
        else:
            data_starts_at = i
            break

    stripped_err_fmag = err_fmag[data_starts_at:]
    stripped_err_phot = err_phot[data_starts_at:]
    stripped_err_exit = err_exit[data_starts_at:]
    stripped_iteration_numbers = iteration_numbers[data_starts_at:]

    # Removing duplicate iteration numbers
    unique_iteration_numbers = []
    unique_err_fmag = []
    unique_err_phot = []
    unique_err_exit = []

    for i, interation_number in enumerate(stripped_iteration_numbers):
        if interation_number in unique_iteration_numbers:
            continue
        else:
            unique_iteration_numbers.append(interation_number)
            unique_err_fmag.append(stripped_err_fmag[i])
            unique_err_phot.append(stripped_err_phot[i])
            unique_err_exit.append(stripped_err_exit[i])

    return (np.array(unique_err_fmag),
            np.array(unique_err_phot),
            np.array(unique_err_exit),
            unique_iteration_numbers)


def normalize_graph(meta_dict):
    error = np.array([info['error'] for info in meta_dict.iter_info])
    raw_err_fmag = error[0:, 0]
    raw_err_phot = error[0:, 1]
    raw_err_exit = error[0:, 2]

    raw_iteration_numbers = [info['iteration'] for info in meta_dict.iter_info]

    # Cleaning up the data
    err_fmag, err_phot, err_exit, iteration_numbers = clean_graph_data(raw_err_fmag, raw_err_phot, raw_err_exit,
                                                                       raw_iteration_numbers)

    def normalize(values):
        if len(values) == 0:
            return np.array([])

        values_max = values.max()
        if values_max == 0:
            # Avoid division by zero
            values_max = 1
        return values / values_max

    fmag = normalize(err_fmag)
    phot = normalize(err_phot)
    ex = normalize(err_exit)

    return {
        'fmag': fmag.tolist(),
        'phot': phot.tolist(),
        'ex': ex.tolist(),
        'iteration_numbers': iteration_numbers
    }
