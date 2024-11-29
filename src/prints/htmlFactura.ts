import {IConfig, IHTMLData, IOperation} from '../common/types';
import {formatToMoney, logoGasGuaviare} from '../utils';

export const htmlFactura = async (
  factura: IOperation,
  config: IConfig,
  opcion: 'FACTURA' | 'PEDIDO',
): Promise<IHTMLData> => {
  try {
    // const formatNumber = (number: number) => {
    //   return new Intl.NumberFormat('es-CO').format(number);
    // };

    const fechaVenceSinFormatear = factura.fechaVencimiento;
    const year = fechaVenceSinFormatear.toString().slice(0, 4);
    const month = fechaVenceSinFormatear.toString().slice(4, 6);
    const day = fechaVenceSinFormatear.toString().slice(6, 8);
    const fechaVencimiento = `${day}/${month}/${year}`;

    const productosHtml = factura.articulosAdded
      .map(articulo => {
        let valorUnidad = 0;

        if (articulo.valorIva > 0) {
          valorUnidad =
            articulo.valorUnidad * articulo.cantidad + articulo.valorIva;
        } else {
          valorUnidad = articulo.valorUnidad * articulo.cantidad;
        }

        return `
    <tr class="product-table-tr">
      <td style="text-align: start">${articulo.descrip}</td>
      <td style="text-align: right">${articulo.cantidad}</td>
      <td style="text-align: right">${articulo.descuento}%</td>
      <td class="product-last-td">${formatToMoney(valorUnidad)}</td>
    </tr>
  `;
      })
      .join('');

    /* 🟥 bloque de calculos */
    let totalCantidades = factura.articulosAdded.reduce(
      (acu, articulo) => acu + Number(articulo.cantidad),
      0,
    );

    let totalSubtotal = 0;
    factura.articulosAdded.forEach(articulo => {
      if (articulo.valorIva > 0) {
        totalSubtotal +=
          articulo.valorUnidad * articulo.cantidad + articulo.valorIva;
      } else {
        totalSubtotal += articulo.valorUnidad * articulo.cantidad;
      }
    });

    let totalTotal = 0;

    let totalDescuento = factura.articulosAdded.reduce(
      (acu, articulo) => acu + articulo.valorDescuento,
      0,
    );

    totalTotal = totalSubtotal - totalDescuento;

    /* 🟥 fin bloque de calculos */

    const styles = `
    .body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
      }
      .center {
        margin-left: auto;
        margin-right: auto;
      }
      .no-margin {
        margin: 0;
      }
      .border-bottom {
        border-bottom: 2px solid black;
      }
      .table {
        width: 100%;
        height: 100%;
        font-size: 12px;
        border-collapse: collapse;
      }
      .header {
        width: 90%;
        display: flex;
        flex-direction: column;
        font-weight: bold;
      }
      .header-td {
        width: 100%;
        height: 33%;
        text-align: center;
      }
      .header-td:first-child {
        margin-top: 15px;
      }
      .header-td:last-child {
        margin-bottom: 15px;
      }
      .client {
        width: 90%;
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
      }
      .client-date {
        width: 50%;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
      }
      .client-order {
        text-align: center;
        font-weight: bold;
      }
      .client-pos {
        width: 40%;
        display: flex;
        flex-direction: row;
        font-weight: bold;
        justify-content: space-between;
      }
      .client-nit {
        width: 50%;
        display: flex;
        flex-direction: row;
        font-weight: bold;
        justify-content: space-between;
      }
      .product {
        width: 100%;
      }
      .product-table {
        width: 90%;
        font-size: 12px;
        border-collapse: collapse;
      }
      .product-table-tr {
        text-align: center;
        font-weight: bold;
      }
      .product-last-td {
        text-align: end;
        padding-right: 10px;
      }
      .info-user {
        width: 90%;
      }
      .info-user-table-1 {
        height: 20%;
        width: 90%;
        font-size: 12px;
        margin-top: 15px;
        padding-bottom: 10px;
      }
      .info-user-table-2 {
        height: 20%;
        width: 90%;
        font-size: 12px;
      }
      .info-user-table-2-last-td {
        font-weight: bold;
        font-size: 16px;
        text-align: center;
      }
      .dian {
        width: 90%;
      }
      .dian-table-1 {
        height: 20%;
        width: 90%;
        font-size: 12px;
        margin-top: 15px;
        padding-bottom: 5px;
      }
      .dian-table-2 {
        height: 20%;
        width: 90%;
        font-size: 12px;
        margin-top: 10px;
        display: flex;
        padding-bottom: 10px;
      }
      .dian-table-3 {
        height: 20%;
        width: 90%;
        font-size: 12px;
        margin-top: 10px;
        padding-bottom: 20px;
        text-align: center;
        font-weight: bold;
      }
      .primaryText {
        margin: 0px;
      }
      .money {
        text-align: right;
      }
  `;
    const html = `
  <html lang="en">
    <head>
      <style>
        ${styles}
      </style>
    </head>    
   <body class="body" style="font-family: Arial, Helvetica, sans-serif">
    <table class="table">
      <tr>
        <img src="${logoGasGuaviare}" style="width: 350px; height: 100px; margin-left: 50px;"/>
      </tr>
      <tr class="header center border-bottom">        
        <td class="header-td">${config.empresa}</td>
        <td class="header-td">${config.nit}</td>
        <td class="header-td">${config.direccion}</td>
      </tr>
      <tr class="client center">
        <td class="client-date center">
          <p>${factura.fecha}</p>
          <p>${factura.hora}</p>
        </td>

        <td>
          <p style="margin: 0px">Responsable de IVA</p>
        </td>

        <td>
          <p style="font-weight: bold; margin: 0px">
            SISTEMA POS ${opcion} ${
      opcion == 'FACTURA'
        ? factura.operador.nro_factura
        : factura.operador.nro_pedido
    }
          </p>
        </td>

        <td style="margin-bottom: 20px"></td>

        <td>
          <p style="margin: 0px">CLIENTE ${factura.tercero.nombre}</p>
        </td>

        <td>
          <p style="margin: 0px">NIT: ${factura.tercero.codigo}</p>
        </td>

        <td style="width: 100%; display: flex; flex-direction: row">
          <p style="width: 50%; margin: 0px">
            FORMA DE PAGO: ${factura.formaPago == '01' ? 'Contado' : 'Credito'}
          </p>
          <p style="width: 50%; margin: 0px">
            VENDEDOR: ${factura.operador.cod_vendedor}
          </p>
        </td>

        <td>
          <p style="margin: 0px">FECHA VENCE: ${fechaVencimiento}</p>
        </td>
      </tr>

      <tr class="product center">
        <td>
          <table class="product-table center">
            <tr
              style="
                font-weight: bold;
                border-top: 2px solid black;
                border-bottom: 2px solid black;
              "
            >
              <td style="padding-bottom: 5px; padding-top: 5px">
                <p class="primaryText">DESCRIPCION</p>
              </td>
              <td style="padding-bottom: 5px; padding-top: 5px">
                <p class="primaryText money">CANTI</p>
              </td>
              <td style="padding-bottom: 5px; padding-top: 5px">
                <p class="primaryText money">DTO</p>
              </td>
              <td
                class="product-last-td"
                style="padding-bottom: 5px; padding-top: 5px"
              >
                <p class="primaryText">VLR TOTAL</p>
              </td>
            </tr>

            ${productosHtml}

            <tr
              class="product-table-tr"
              style="border-top: 2px solid black; margin-top: 20px"
            >
              <td style="text-align: start">
                <p class="primaryText">SUB-TOTAL</p>
              </td>
              <td class="money">
                <p class="primaryText">${totalCantidades}</p>
              </td>
              <td></td>
              <td class="product-last-td">
                <p class="primaryText">${formatToMoney(totalSubtotal)}</p>
              </td>
            </tr>

            <tr class="product-table-tr">
              <td style="text-align: start">
                <p class="primaryText">VLR-EXCLUIDO IVA</p>
              </td>
              <td class="money"></td>
              <td></td>
              <td class="product-last-td"></td>
            </tr>

            <tr class="product-table-tr">
              <td style="text-align: start">DESCUENTOS</td>
              <td></td>
              <td></td>
              <td class="product-last-td">${formatToMoney(totalDescuento)}</td>
            </tr>

            <tr class="product-table-tr border-bottom" style="font-size: 14px">
              <td style="text-align: start">TOTAL ${
                opcion == 'FACTURA' ? 'FACTURA' : 'PEDIDO'
              }</td>
              <td></td>
              <td></td>
              <td class="product-last-td">${formatToMoney(totalTotal)}</td>
            </tr>
          </table>
        </td>
      </tr>

      <tr class="info-user center">
        <td>
          <table class="info-user-table-1 center border-bottom">
            <tr>
              <td style="width: 50%">ACEPTADA: _____________________</td>
              <td>
                <p class="primaryText" style="margin: 0px">
                  VENDEDOR: ${factura.operador.cod_vendedor}
                </p>
              </td>
            </tr>
          </table>
          <table
            class="info-user-table-2 center border-bottom"
            style="margin-top: 10px"
          >
            <tr>
              <td>
                <p style="margin-top: 10px">
                  Nombre: ____________________________________
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p style="margin-top: 10px">
                  Cedula: _____________________________________
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p style="margin-top: 10px">
                  Celular: _____________________________________
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p style="margin-top: 10px">
                  Direccion: ___________________________________
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p
                  class="primaryText"
                  style="margin-top: 15px"
                >
                   Esta factura de servicios públicos se asimila en sus efectos a la letra de cambio Art. 774 del C.com. GAS GUAVIARE S.A. E.S.P., es un comercializador minorista de GLP de la marca RAYOGAS, regulado por la Ley 142 del 11 de julio de 1994, y vigilada por la Superintendencia de Servicios Públicos – SSPD. En materia de facturación, la empresa se encuentra sometida a lo establecido en la Resolución 0042 del 05 de mayo de 2020 en sus artículos 13 numeral 11 y en artículo 14, en virtud a que las empresas prestadoras de servicios públicos domiciliarios emiten Facturas de Servicios Públicos las que se consideran como un documento equivalente. Por lo tanto, este documento es soporte legal para la deducción de costos y gastos.
                </p>
                <p
                  class="primaryText"
                  style="margin-top: 15px"
                >
                   NOTA: El documento soporte equivalente a la factura, para los prestadores de servicios públicos domiciliarios no contempla autorización de numeración, tampoco se requiere de la aceptación expresa del cliente para su ejecución.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr class="dian center">
        <td>
          

          <table
            class="dian-table-3 center"
            
          >
            <tr>
              <td>Software SC-PROSOFT NIT 900.448.596-6</td>
            </tr>                        
          </table>                  
        </td>
      </tr>
    </table>
  </body>
  </html>
`;
    const htmlData: IHTMLData = {
      html: html,
      fileName: `${opcion == 'FACTURA' ? 'FACTURA' : 'PEDIDO'} #${
        opcion == 'FACTURA'
          ? factura.operador.nro_factura
          : factura.operador.nro_pedido
      }`,
      directory: 'Download',
      base64: false,
      height: 380,
      width: 350,
      //pageSize: '78mm',
    };
    // height 475 imprime bien pero se bloquea
    return htmlData;
  } catch (error) {
    console.error('Error in htmlPedidos:', error);
    throw error;
  }
};

/* 
<div style="width: 90%; margin: 0px auto; padding-top: 10px">
            <div
              style="
                display: flex;
                flex-direction: row;
                justify-content: space-between;
              "
            >
              <p class="primaryText">A. Dian: ${factura.operador.auto_dian}</p>
              <p class="primaryText">de ${factura.operador.fecha_ini}</p>
              <p class="primaryText">V.${factura.operador.vigencia} meses</p>
            </div>

            <div style="display: flex; flex-direction: row; margin-top: 10px">
              <p class="primaryText" style="width: 30%">
                Desde: ${factura.operador.prefijo} ${factura.operador.nro_ini}
              </p>
              <p class="primaryText" style="width: 70%">
                Hasta: ${factura.operador.prefijo} ${factura.operador.nro_fin}
              </p>
            </div>
          </div>
*/
