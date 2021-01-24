import java.io.*;
import java.util.*;
class Main {
	public static void main (String[] args) {
	try
		{
			BufferedReader bf=new BufferedReader(new InputStreamReader(System.in));
			String str=bf.readLine();
			int count=0;
			for(int i=0;i<str.length();i++)
			{
				if(str.charAt(i)==' ')count=0;
				else count++;
			}
			System.out.println(count);
		}catch(Exception e)
		{
			System.out.println(e);
		}
	}
}