import Connection from "./Connection";

class Statment {
  private token: string;
  private network: Connection;

  constructor(token: string) {
    this.token = token;
    this.network = new Connection(token);
  }

  async get(acno: string, fromDate: string, toDate: string) { 
    

  const statementData = [];
  const headerData = await this.getHeaderData(acno);
  const bodyData = await this.getBodyData(acno, fromDate, toDate);
  statementData.push(headerData, bodyData);
  return statementData;
}
  private getHeaderData(acno: string): Promise<any> {
    const select = `MPHONE, NVL (PMPHONE,MPHONE) PMPHONE, ACCOUNT_NAME,(SELECT P.ACC_TYPE_NAME FROM AGENT_BANKING.PRODUCT_SETUP P WHERE P.ACC_TYPE_CODE = R.AC_TYPE_CODE) TYPE,(SELECT ST.NAME FROM AGENT_BANKING.AC_STATUS ST WHERE ST.S_NAME = R.STATUS) STATUS,TO_CHAR (REG_DATE,'MONTH dd, YYYY') REG_DATE,TO_CHAR (R.EMAIL) EMAIL,
    ROUND ((FUNC_GET_ACC_BALANCE (R.MPHONE,(TO_DATE ( :TODATE) - 1))),2) BALANCE,TO_CHAR (MATURITY_DATE,'MONTH dd, YYYY') MATURITY_DATE,CUST_ID,CON_MOB,PRE_VILLAGE|| ', '|| PRE_ROAD|| ', '|| PRE_POST|| ', '|| (SELECT NAME || ', ' || (SELECT NAME || ', ' || (SELECT NAME || ', ' || (SELECT NAME FROM AGENT_BANKING.DISTHANA WHERE CODE = F.PARENT) FROM AGENT_BANKING.DISTHANA F WHERE CODE = E.PARENT) FROM
    AGENT_BANKING.DISTHANA E WHERE CODE = D.PARENT) FROM AGENT_BANKING.DISTHANA D WHERE CODE = (SELECT SUBSTR (LOCATION_CODE,0,6) FROM AGENT_BANKING.REGINFO WHERE MPHONE = R.MPHONE)) ADDR`;
    const from = `AGENT_BANKING.REGINFO R`;
    const where = `MPHONE = ${acno}`;

    return new Promise((resolve, reject) => {
      try {
        const data = this.network.conn(select, from, where);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
  }
  private getBodyData(acno:string, fromDate:string, toDate:string): Promise<any> {
   
    const select:string =`ROW_NUMBER() OVER (ORDER BY P.TRANS_NO ASC) AS "SL",
          NVL (P.CR_AMT,0) CR_AMT,
          NVL (P.DR_AMT,0) DR_AMT,
          P.TRANS_NO TRANS_NO,
          P.TRANS_DATE TRANS_DATE,
        P.PARTICULAR PARTICULAR`
       const from:string = `(SELECT * FROM AGENT_BANKING.GL_TRANS_DTL UNION SELECT * FROM AGENT_BANKING.GL_TRANS_DTL_OLD) P`
      const  where:string = `BALANCE_MPHONE = TO_CHAR(${acno})
    AND TRUNC (TRANS_DATE) BETWEEN TO_DATE(${fromDate})
    AND TO_DATE(${toDate})
ORDER BY
    TRANS_NO ASC`

    return new Promise((resolve, reject) => {
      try {
        const data = this.network.conn(select, from, where);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
  }
}

export default Statment;
