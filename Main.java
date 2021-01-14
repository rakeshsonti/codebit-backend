import java.io.*;
import java.util.*; 
class Main {
	static class Node {
		int value;
		Node left;
		Node right;
		Node(int v) {
			this.value = v;
		}
	}
	public static void main (String[] args) {
		Scanner sc = new Scanner(System.in);
		int N = sc.nextInt();
		Map<Integer, Node> nodes = new HashMap<>();
		nodes.put(1, new Node(1));
		Node BSTRoot = nodes.get(1);
		for(int i=1;i<(N+1);i++){
			Node left = new Node(sc.nextInt());
			Node right = new Node(sc.nextInt());
			nodes.get(i).left = left.value == -1? null: left;
			nodes.get(i).right = right.value == -1? null: right;
			if(left.value != -1) {
				nodes.put(left.value, left);
			}
			if(right.value != -1) {
				nodes.put(right.value, right);
			}
		}
		printInOrder(BSTRoot);
		System.out.println();
	}
	static void printInOrder(Node root) {
		if(root == null) {
			return;
		}
		// traverse left
		printInOrder(root.left);
		System.out.print(root.value + " ");
		// traverse right
		printInOrder(root.right);
	}
}