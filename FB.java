import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;

public class FB {

	public static void main(String[] args) throws IOException {
		
		String file = "facebook_in.txt";
		BufferedReader in = new BufferedReader(new FileReader(file));
		ArrayList<ArrayList<Integer>> adjLists = new ArrayList<ArrayList<Integer>>(4039);
		for(int i = 0; i < 4039; i++) adjLists.add(new ArrayList<Integer>());
		try { /* read file */
			while (in.ready()) {
				String s = in.readLine();
				String[] split = s.split(" ");
				adjLists.get(Integer.parseInt(split[0])).add(Integer.parseInt(split[1]));
				adjLists.get(Integer.parseInt(split[1])).add(Integer.parseInt(split[0]));
			}
		} catch (Exception e) {
			System.err.println(e);
		} finally {
			in.close();
		} /* end read file */
		for(int i = 0; i < 4039; i++) {
			Collections.sort(adjLists.get(i));
		}
		String out = "FB_graph.js";
		
		PrintWriter writer = new PrintWriter(out, "UTF-8");
		writer.println("var FB = {");
		writer.println("\tnumVertices: 4039,");
		writer.println("\t adjacencyLists: [");
		for(int i = 0; i < 4039; i++) {
			writer.print("\t\t[");
			for(int j = 0; j < adjLists.get(i).size()-1; j++) {
				writer.print(adjLists.get(i).get(j) + ",");
			}
			writer.println(adjLists.get(i).get(adjLists.get(i).size()-1) + "],");
		}
		writer.println("],");
		writer.println("\t vertexPositions: []\n};");
		writer.close();
	}
}