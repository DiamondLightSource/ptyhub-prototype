import os
import json
from models import parameter_tree_structure as pt_models
import getpass
from util import deployment_restrictions


def _convert_param_to_pydantic(param, name=None):
    if isinstance(param, dict):
        branch_values = {}
        for key, value in param.items():
            branch_values[key] = _convert_param_to_pydantic(value, key)

        return pt_models.ParameterTreeStructureBranch(value=branch_values)

    return pt_models.ParameterTreeStructureLeaf(
        name=name,
        user_level=0,
        description_short=f"{name}",
        parameterType=[type(param).__name__],
        description_long="",
        default=param,
        choices=None
    )


def get_pydantic_parameter_tree():
    # Get the directory of the script
    script_dir = os.path.dirname(os.path.abspath(__file__))

    config_file_path = os.getenv('PTYHUB_PTYREX_TEMPLATES')
    if config_file_path is None:
        # Construct the default file path relative to the script directory
        default_config_folder_path = os.path.join(script_dir, 'config_templates')
        config_file_path = os.path.join(default_config_folder_path, "ptyrex_config_templates.json")

    with open(config_file_path, "r") as f:
        ptyrex_config_templates = json.load(f)

    options = [pt_models.ExtraOption(
        type=pt_models.ExtraOptionType.RANGE_INPUT,
        friendly_name="Projections",
        config_name="projections",
        default_value=["0"],
    )]

    beamlines = []
    config_templates_folder = os.path.dirname(config_file_path)

    default_output_folder = ""
    if deployment_restrictions.is_local():
        default_output_folder = f"/dls/tmp/{getpass.getuser()}/"

    for template in ptyrex_config_templates:
        template_name = template["name"]
        template_path = template["path"]
        template_path_abs = template_path

        # The path can be relative, so if it is we find the absolute path relative to the config file
        if not os.path.isabs(template_path):
            template_path_abs = os.path.join(config_templates_folder, template_path)

        with open(template_path_abs, "r") as f:
            beamline_config = json.load(f)
            beamlines.append(
                pt_models.ParameterTreeBeamline(
                    id=f"ptyrex/{template_name}",
                    name=template_name,
                    parameter_tree_type=pt_models.ParameterTreeType.PTYREX,
                    definitions={},
                    root=_convert_param_to_pydantic(beamline_config),
                    default_output_folder=default_output_folder,
                    extra_options=options,
                    save_extra_options_to_config=False
                )
            )

    return pt_models.ParameterTreeStructure(
        name="PtyRex Parameter Tree",
        beamlines=beamlines
    )


if __name__ == "__main__":
    get_pydantic_parameter_tree()
