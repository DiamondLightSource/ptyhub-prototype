import React, { useMemo } from 'react';
import './ParameterConfigurationSubsectionSearchParameterTree.css';
import { get as levenshtein } from 'fast-levenshtein';
import TreeNavigator from '../TreeNavigator/TreeNavigator';
import { Tree } from '../../types/tree';
import CustomTextInput from '../CustomTextInput/CustomTextInput';

type Props = {
  tree: Tree
  selectedParamIdPath: string[]
  onParamSelect: (id: string[]) => void
};

function ParameterConfigurationSubsectionParameterTree({
  tree, selectedParamIdPath, onParamSelect,
}: Props) {
  const [search, setSearch] = React.useState<string>('');

  // We change the tree if the search string changes
  const [displayedTree, searchTreeIdPathGlobalTreeIdPath] = useMemo<[
    Tree, Record<string, string[]>,
  ]>(() => {
    const searchLower = search.toLowerCase();
    const searchResults: Tree[] = [];
    const searchTreePathIdGlobalTreePathIdLocal: Record<string, string[]> = {};
    const traverse = (node: Tree, parentIdPath: string[]) => {
      if (node.name.toLowerCase().includes(searchLower) && node.children.length === 0) {
        searchResults.push(node);
        searchTreePathIdGlobalTreePathIdLocal[node.id] = [...parentIdPath, node.id];
      }
      node.children.forEach((child) => traverse(child, [...parentIdPath, node.id]));
    };

    if (search !== '') {
      traverse(tree, []);

      // Sort search results by levenshtein distance to provide better results
      searchResults.sort((a, b) => {
        const aDistance = levenshtein(a.name.toLowerCase(), searchLower);
        const bDistance = levenshtein(b.name.toLowerCase(), searchLower);
        return aDistance - bDistance;
      });
    }

    const newTree: Tree = {
      id: 'search-root',
      name: `Search Results (${searchResults.length})`,
      preventClick: true,
      areChildrenMutable: false,
      allowAddChildren: false,
      children: searchResults.slice(0, 20),
    };

    return [newTree, searchTreePathIdGlobalTreePathIdLocal];
  }, [tree, search]);

  const translatedSelectedParamIdPath = useMemo<string[]>(() => {
    // If the selected parameter is in the search results, we want to select it in the search
    // results
    //
    // To do this, we need to translate the selected parameter's id path to the search results'
    // id path
    const entries = Object.entries(searchTreeIdPathGlobalTreeIdPath);
    for (let i = 0; i < entries.length; i += 1) {
      const [searchTreeIdPath, globalTreeIdPath] = entries[i];
      if (selectedParamIdPath.join('-') === globalTreeIdPath.join('-')) {
        return ['search-root', searchTreeIdPath];
      }
    }

    return [];
  }, [selectedParamIdPath, searchTreeIdPathGlobalTreeIdPath]);

  return (
    <div className="parameter-configuration-subsection-search-parameter-tree">
      <CustomTextInput
        type="text"
        placeholder="Search"
        className="parameter-configuration-subsection-search-parameter-tree__search"
        value={search}
        onChange={setSearch}
      />
      <TreeNavigator
        tree={displayedTree}
        selectedIdPath={translatedSelectedParamIdPath}
        onSelect={(selected) => {
          // Get last element of selected id path
          onParamSelect(searchTreeIdPathGlobalTreeIdPath[selected[selected.length - 1]]);
        }}
        disablePathInput
        expandFully
      />
    </div>
  );
}

export default ParameterConfigurationSubsectionParameterTree;
