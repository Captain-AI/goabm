package main

import (
	"math/rand"
	"syscall"
	"time"
	"unsafe"

	"github.com/divan/goabm/abm"
	"github.com/divan/goabm/ui/term_grid"
	"github.com/divan/goabm/worlds/grid2d"
)

// Walker implements abm.Agent
type Walker struct {
	x, y int
	abm  *abm.ABM
}

func (w *Walker) Run(i int) {
	rx := rand.Intn(4)
	oldx, oldy := w.x, w.y
	switch rx {
	case 0:
		w.x++
	case 1:
		w.y++
	case 2:
		w.x--
	case 3:
		w.y--
	}
	w.abm.World().(*grid.Grid).Move(oldx, oldy, w.x, w.y)
}

func main() {
	rand.Seed(time.Now().UnixNano())
	a := abm.New()
	w, h := getTermSize()
	grid2D := grid.New(w, h)
	a.SetWorld(grid2D)

	for i := 0; i < 1; i++ {
		cell := &Walker{rand.Intn(w - 1), rand.Intn(h - 1), a}
		a.AddAgent(cell)
		grid2D.SetCell(cell.x, cell.y, cell)
	}

	a.LimitIterations(1000)

	ch := make(chan [][]bool)
	a.SetReportFunc(func(a *abm.ABM) {
		ch <- grid2D.Dump(func(a abm.Agent) bool { return a != nil })
		time.Sleep(10 * time.Millisecond)
	})

	go func() {
		a.StartSimulation()
		close(ch)
	}()

	ui := termgrid.New(w, h, ch)
	defer ui.Stop()
	ui.Loop()
}

type winsize struct {
	Row    uint16
	Col    uint16
	Xpixel uint16
	Ypixel uint16
}

func getTermSize() (int, int) {
	ws := &winsize{}
	retCode, _, errno := syscall.Syscall(syscall.SYS_IOCTL,
		uintptr(syscall.Stdin),
		uintptr(syscall.TIOCGWINSZ),
		uintptr(unsafe.Pointer(ws)))

	if int(retCode) == -1 {
		panic(errno)
	}
	return int(ws.Col) - 1, int(ws.Row) - 1
}