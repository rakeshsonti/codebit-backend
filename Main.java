import java.io.*; // for handling input/output
import java.util.*; // contains Collections framework

// don't change the name of this class
// you can add inner classes if needed
class Main {
	static double pow(double num, double powNum)
	{
		if(powNum==0)return 1;
		return num*(pow(num,powNum-1));
		
	}
	public static void main (String[] args) 
	{
		try
		{
			BufferedReader bf=new BufferedReader(new InputStreamReader(System.in));
			String str=bf.readLine();
			String str1[]=str.split("\\s");
			int test=Integer.parseInt(str1[0]);
			while(test-->0)
			{
				str=bf.readLine();
				str1=str.split("\\s");
				double num=Double.parseDouble(str1[0]);
				double powNum=Double.parseDouble(str1[1]);
				// double result=-(pow(num,powNum));
				// System.out.printf("%.2f\n",result);
					if(powNum<0)
					{
					double result=1/(pow(num,-powNum));
					System.out.printf("%.2f\n",result);
					}else{
					double result=(pow(num,powNum));
					System.out.printf("%.2f\n",result);

					}
				
				
				
			}
		}catch(Exception e)
		{
			System.out.println(e);

		}
}
}