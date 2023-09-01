from __future__ import annotations

from pydantic import BaseModel, Field
import typing
import enum


class ParameterTreeStructureBaseModel(BaseModel):
    type: str


class ParameterTreeType(enum.Enum):
    PTYPY = "PTYPY"
    PTYREX = "PTYREX"


class ParameterTreeBeamline(BaseModel):
    id: str
    name: str
    parameter_tree_type: ParameterTreeType
    definitions: typing.Dict[str, typing.Union[ParameterTreeStructureBranchMutable, ParameterTreeStructureBranch]]
    root: typing.Union[ParameterTreeStructureBranch, ParameterTreeStructureBranchMutable]
    default_output_folder: str
    extra_options: typing.List[ExtraOption]
    save_extra_options_to_config: bool


class ParameterTreeStructure(ParameterTreeStructureBaseModel):
    type: str = "ParameterTreeStructure"
    name: str
    beamlines: typing.List[ParameterTreeBeamline]


class ParameterTreeStructureBranch(ParameterTreeStructureBaseModel):
    type: str = "ParameterTreeStructureBranch"
    value: typing.Dict[str, typing.Union[
        ParameterTreeStructureBranch,
        ParameterTreeStructureBranchMutable,
        ParameterTreeStructureLeaf,
        Reference
    ]]


class ParameterTreeStructureBranchMutable(ParameterTreeStructureBranch):
    type: str = "ParameterTreeStructureBranchMutable"
    default_key: str
    default_name: str
    allow_multiple: bool


class ParameterTreeStructureLeaf(ParameterTreeStructureBaseModel):
    type: str = "ParameterTreeStructureLeaf"
    name: str
    parameterType: typing.List[str]
    user_level: int
    description_short: str
    description_long: str
    default: typing.Optional[typing.Any]
    choices: typing.Optional[typing.List[typing.Union[None, int, float, bool, str]]]

    class Config:
        smart_union = True


class Reference(ParameterTreeStructureBaseModel):
    type: str = "Reference"
    ref: str = Field(alias="$ref")


class ExtraOptionType(enum.Enum):
    FILE_SELECT = "FILE_SELECT"
    RANGE_INPUT = "RANGE_INPUT"


class ExtraOption(BaseModel):
    type: ExtraOptionType
    friendly_name: str
    config_name: str
    default_value: typing.Any


ParameterTreeBeamline.update_forward_refs()
ParameterTreeStructure.update_forward_refs()
ParameterTreeStructureBranch.update_forward_refs()
ParameterTreeStructureBranchMutable.update_forward_refs()
ParameterTreeStructureLeaf.update_forward_refs()
