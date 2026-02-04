import { ODSPaginationTableChangeEventOptions, ODSTable, ODSTableBody, ODSTableHead, ODSTableHeadCell, ODSTableHeadCellProps, ODSTableHeadCellType, ODSTableHeadRow, ODSTableRow, ODSTableRowCell, ODSTableRowCellProps, ODSTableRowProps } from "@telekom-ods/react-ui-kit";
import { orderBy } from "lodash";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Dic } from "~/Helpers/Entities";
import reviewsHistoryMock from "./reviewsHistoryMock.json";

/**
 * @author Aloento
 * @since 1.3.0
 * @version 0.2.0
 */
export function Reviews() {
  const [order, setOrder] = useState<"asc" | "desc" | undefined>()
  const [orderByIndex, setOrderByIndex] = useState<number | undefined>()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  function handleSortChange(index: number) {
    let newOrder: "asc" | "desc" | undefined;
    let newOrderByIndex: number | undefined;

    if (orderByIndex !== index) {
      newOrder = "asc";
      newOrderByIndex = index;
    } else {
      newOrder = order === "asc" ? "desc" : undefined;
      newOrderByIndex = order === "asc" ? index : undefined;
    }

    setOrder(newOrder)
    setOrderByIndex(newOrderByIndex)
  }

  function paginationChange(event: ODSPaginationTableChangeEventOptions) {
    if (page !== event.page) setPage(event.page)
    if (pageSize !== event.pageSize) setPageSize(event.pageSize)
  }

  const tableHeadRowCells: ODSTableHeadCellProps[] = [
    { id: "0", label: "ID", alignment: "left", showSortIndicator: true },
    { id: "1", label: "Plan Start CET", showSortIndicator: true },
    { id: "2", label: "Plan End CET", showSortIndicator: true },
    { id: "3", label: "Region", showSortIndicator: true },
    { id: "4", label: "Service", showSortIndicator: true },
    {
      id: "5",
      label: "Detail",
      alignment: "right",
      showSortIndicator: false,
    },
  ]

  interface ReviewItem {
    id: number;
    planStartCET: string;
    planEndCET: string;
    region: string;
    service: string;
  }

  const historyItems = reviewsHistoryMock as ReviewItem[]

  const tableRowCells: Record<number, ODSTableRowCellProps[]> = historyItems.reduce(
    (rows, item, index) => {
      rows[index] = [
        {
          id: `0`,
          type: "label",
          label: item.id,
          "data-content": item.id,
        },
        {
          id: `1`,
          type: "label",
          label: item.planStartCET,
          "data-content": item.planStartCET,
        },
        {
          id: `2`,
          type: "label",
          label: item.planEndCET,
          "data-content": item.planEndCET,
        },
        {
          id: `3`,
          type: "label",
          label: item.region,
          "data-content": item.region,
        },
        {
          id: `4`,
          type: "label",
          label: item.service,
          "data-content": item.service,
        },
        {
          id: `5`,
          type: "action",
          alignment: "right",
          actionProps: {
            ariaLabel: "View Event Details",
            buttonIcon: "more-type-bold",
            buttonType: "link",
            size: "small",
            variant: "ghost",
            href: `/Event/${item.id}`,
            leftIcon: true
          }
        },
      ]
      return rows;
    },
    {} as Record<number, ODSTableRowCellProps[]>
  )

  const tableRows: ODSTableRowProps[] = historyItems.map((_, index) => ({
    id: `row_${index}`,
    "aria-rowindex": index,
  }))

  interface ProductRow {
    props: ODSTableRowProps;
    cells: ODSTableRowCellProps[]
  }

  const productRows: ProductRow[] = tableRows.map((rowProps, index) => ({
    props: rowProps,
    cells: tableRowCells[index],
  }))

  function getCellType(index: number): ODSTableHeadCellType {
    if (orderByIndex !== index) return "unsorted";
    if (order === "asc") return "sortedUp";
    return "sortedDown";
  }

  const visibleProductRows = useMemo(
    () => {
      let sorted = productRows;
      if (order) {
        sorted = orderBy(
          productRows,
          (productRow) => productRow.cells[orderByIndex ?? -1]["data-content"],
          [order]
        );
      }
      return sorted.slice(page * pageSize, page * pageSize + pageSize);
    },
    [order, orderByIndex, page, pageSize]
  );

  return (
    <>
      <Helmet>
        <title>Reviews - {Dic.Name} {Dic.Prod}</title>
      </Helmet>

      <h3 className="text-3xl font-medium text-slate-800">Pending Review Maintenances</h3>

      <ODSTable
        onPaginationChange={paginationChange}
        totalRows={productRows.length}
        initialPage={0}
        initialPageSize={10}
        pagination
        pageSizeOptions={[10, 20, 50]}
      >
        <ODSTableHead>
          <ODSTableHeadRow>
            {tableHeadRowCells.map((props, cellIndex) => (
              <ODSTableHeadCell
                {...props}
                key={props.id}
                type={getCellType(cellIndex)}
                onSort={() => handleSortChange(cellIndex)} />
            ))}
          </ODSTableHeadRow>
        </ODSTableHead>

        <ODSTableBody>
          {visibleProductRows.map(({ props, cells }) => (
            <ODSTableRow
              {...props}
              key={props.id}
            >
              {cells.map((cellProps) => (
                <ODSTableRowCell {...cellProps} key={cellProps.id} />
              ))}
            </ODSTableRow>
          ))}
        </ODSTableBody>
      </ODSTable>
    </>
  )
}
