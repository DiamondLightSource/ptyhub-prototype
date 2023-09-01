import { ParameterTreeBeamline } from './ParameterTreeBeamline';

export type ParameterTreeStructure = {
  type?: string;
  name: string;
  beamlines: Array<ParameterTreeBeamline>;
};
