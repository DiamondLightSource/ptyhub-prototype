FROM continuumio/miniconda3:23.3.1-0

# Install necessary tools like git
RUN apt-get update && apt-get install -y git && apt-get install -y curl

# Clone ptypy repo
WORKDIR /ptypy
RUN git clone https://github.com/ptycho/ptypy.git .
RUN git checkout dls_alpha

# Install backend environment
WORKDIR /ptyhub/
COPY environment.yml .
RUN conda env create -f environment.yml

# Install ptypy dependencies and setup
RUN conda run -n ptyhub conda env update --name ptyhub --file /ptypy/dependencies_full.yml

# Install ptypy via pip into the ptyhub env
RUN conda run -n ptyhub pip install -e /ptypy

# Clone ptydls repo
WORKDIR /ptydls/
RUN git clone https://gitlab.diamond.ac.uk/scisoft/ptychography/ptydls.git .
RUN git checkout remove_make_dir_tmp_fix

# Install ptydls via pip into the ptyhub env
RUN conda run -n ptyhub pip install -e /ptydls

WORKDIR /ptyhub/

# Run the backend
EXPOSE 8000
COPY . .
CMD ["bash", "-c", "source activate ptyhub && uvicorn app:app --host 0.0.0.0 --port 8000 --proxy-headers"]
