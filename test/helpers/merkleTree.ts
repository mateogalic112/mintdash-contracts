import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

const getMerkleProof = (whitelist: string[], addr: string) => {
  const leaves = whitelist.map(addr => keccak256(addr));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const leaf = keccak256(addr);
  const proof = tree.getHexProof(leaf);
  return proof;
};

const getMerkleTreeRoot = (whitelist: string[]) => {
  const leaves = whitelist.map(addr => keccak256(addr));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getRoot().toString('hex');
  return root;
};

export { getMerkleProof, getMerkleTreeRoot };
